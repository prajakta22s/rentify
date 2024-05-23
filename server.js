const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const nodemailer = require('nodemailer');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

mongoose.connect('mongodb://localhost:27017/rentify', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected...'))
.catch(err => console.log(err));

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: { type: String, unique: true, required: true },
  phoneNumber: String,
  userType: String, // 'buyer' or 'seller'
  password: { type: String, required: true },
});

userSchema.pre('save', async function (next) {
  if (this.isModified('password') || this.isNew) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

const propertySchema = new mongoose.Schema({
  sellerId: mongoose.Schema.Types.ObjectId,
  title: String,
  description: String,
  location: String,
  minPrice: Number,
  maxPrice: Number,
  area: Number,
  nearby: String,
  imageUrl: String,
  likes: { type: Number, default: 0 },
  interestedBuyers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
});

const User = mongoose.model('User', userSchema);
const Property = mongoose.model('Property', propertySchema);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage: storage });

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-email-password'
  }
});

app.post('/api/register', async (req, res) => {
  const { firstName, lastName, email, phoneNumber, userType, password } = req.body;
  try {
    const user = new User({ firstName, lastName, email, phoneNumber, userType, password });
    await user.save();
    res.status(201).send({ message: 'User registered successfully', user });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).send({ error: 'Invalid email or password' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send({ error: 'Invalid email or password' });
    }
    res.status(200).send({ message: 'Login successful', user });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// Add Property
app.post('/api/properties', upload.single('image'), async (req, res) => {
  const { sellerId, title, description, location, minPrice, maxPrice, area, nearby } = req.body;
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
  try {
    const property = new Property({ sellerId, title, description, location, minPrice, maxPrice, area, nearby, imageUrl });
    await property.save();
    res.status(201).send({ message: 'Property added successfully', property });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

// Get All Properties
app.get('/api/properties', async (req, res) => {
  try {
    const properties = await Property.find();
    res.status(200).send(properties);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

// Get Properties by Seller
app.get('/api/properties/seller/:sellerId', async (req, res) => {
  try {
    const properties = await Property.find({ sellerId: req.params.sellerId });
    res.status(200).send(properties);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

// Update Property
// Update Property
app.put('/api/properties/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    if (req.file) {
      updates.imageUrl = `/uploads/${req.file.filename}`;
    }
    const property = await Property.findByIdAndUpdate(id, updates, { new: true });
    if (!property) {
      return res.status(404).send({ error: 'Property not found' });
    }
    res.status(200).send({ message: 'Property updated successfully', property });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});


// Delete Property
app.delete('/api/properties/:id', async (req, res) => {
  try {
    await Property.findByIdAndDelete(req.params.id);
    res.status(200).send({ message: 'Property deleted successfully' });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

// Like Property
app.post('/api/properties/:id/like', async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    property.likes += 1;
    await property.save();
    res.status(200).send({ message: 'Property liked successfully', property });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

// Interested in Property
app.post('/api/properties/:id/interested', async (req, res) => {
  const { userId } = req.body;
  try {
    const property = await Property.findById(req.params.id);
    property.interestedBuyers.push(userId);
    await property.save();

    const buyer = await User.findById(userId);
    const seller = await User.findById(property.sellerId);

    // Send email to seller
    const mailOptions = {
      from: 'your-email@gmail.com',
      to: seller.email,
      subject: 'New Interested Buyer',
      text: `Hello ${seller.firstName},\n\n${buyer.firstName} is interested in your property titled "${property.title}".\n\nContact details:\nEmail: ${buyer.email}\nPhone: ${buyer.phoneNumber}`
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log(error);
      }
      console.log('Email sent: ' + info.response);
    });

    // Send email to buyer
    const mailOptionsBuyer = {
      from: 'your-email@gmail.com',
      to: buyer.email,
      subject: 'Interest Confirmation',
      text: `Hello ${buyer.firstName},\n\nYou have shown interest in the property titled "${property.title}" owned by ${seller.firstName}. You can contact the seller via email: ${seller.email} or phone: ${seller.phoneNumber}`
    };
    transporter.sendMail(mailOptionsBuyer, (error, info) => {
      if (error) {
        return console.log(error);
      }
      console.log('Email sent: ' + info.response);
    });

    res.status(200).send({ message: 'Interest noted and emails sent', property });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
