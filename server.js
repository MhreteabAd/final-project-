const express=require('express');
const app=express();
const User=require('./models/users');
const bodyParser=require('body-parser');
const session=require('express-session');
const bcrypt=require('bcryptjs');
const MongoStore = require('connect-mongo');
const Joi = require("joi");
const multer=require('multer');




var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})
var upload = multer({ storage: storage })


app.use(express.static(__dirname + '/uploads'));
app.use('./uploads', express.static('uploads'));

app.post('/profile-upload-multiple', upload.array('profile-files', 12), function (req, res, next) {
 
  var response = '<a href="/">Home</a><br>'
  response += "Files uploaded successfully.<br>"
  for(var i=0;i<req.files.length;i++){
      response += `<img src="${req.files[i].path}" /><br>`
  }
  
  return res.send(response)
})



app.use(
   session({
   secret:"123321AABBCCDD",
    store: MongoStore.create({
      mongoUrl:"mongodb://localhost:27017/demo",
      collectionName:"session",
  }),
    cookie:{
      maxAge:1000*60*60*24,
       secure:false,
  },
  }));




app.set('view engine','ejs');

app.use(bodyParser.urlencoded({ extended: false }));



app.post('/Login', async(req,res)=>{
    const {email, password}=req.body;

    const user=await User.findOne({email});
    if(!user){
        return res.status(400).send("user not found!");

    }

    const isMatch= await bcrypt.compare(password,user.password);
    if(!isMatch){
        return res.status(400).send('Incorrect password!');

    }
        req.session.user = {
          id: user.id,
          role: user.role,
        };
      
        res.render("Home.ejs");
    });

const schema = Joi.object({
  firstname: Joi.string().alphanum().min(3).max(30).required(),
  lastname: Joi.string().alphanum().min(3).max(30).required(),
  
  email: Joi.string().email({
    minDomainSegments: 2,
    tlds: { allow: ["com", "net"] },
  }),
  password: Joi.string(),
  role: Joi.string().valid('user', 'admin')
});


app.post("/register", async (req, res) => {
  const schema = Joi.object({
    firstname: Joi.string().min(3).max(30).required(),
    lastname: Joi.string().min(3).max(30).required(),

    email: Joi.string().email({
      minDomainSegments: 2,
      tlds: { allow: ["com", "net"] },
    }),
    phonenumber: Joi.string(),
    password: Joi.string(),
    photo: Joi.string(),
    role: Joi.string().valid('user', 'admin')
  });

  try {
    const validateResults = schema.validate(req.body);
    if(validateResults.error) {
      return res.send(validateResults.error.details).status(400);
    
    }
  } catch (err) {
    return res.send('error happened!!').status(500);
  }

  const user = new User({
      firstname:req.body.firstname,
      lastname:req.body.lastname,
      email:req.body.email,
      phonenumber:req.body.phonenumber,
      role: req.body.role,
      password: await bcrypt.hash(req.body.password, 10),
    
  });

  await user.save();
  return res.render("Login.ejs");
});


const userform = require('./models/userform');
app.post('/blog', async (req, res) => {
 
  const { title, description } = req.body;
  if (!title || !description) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }
  const newuserform = new userform({
    title:req.body.title,
    description:req.body.description,
  });

  await newuserform.save();
  
  res.sendStatus(201);
});


app.get('/profile',(req,res)=>{
  res.render("profile");
  });
  




//post

 /*
app.post('/profile', async (req, res) => {
  try {
    const { title, description, imageUrl } = req.body;

    // Create a new Photo instance
    const photo = new photo({
      title,
      description,
      imageUrl
    });

    // Save the photo to the database
    const savedPhoto = await photo.save();

    res.status(201).json(savedPhoto);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

*/

//
app.get("/", (req, res) => {
    if (req.session.user) {
      if (req.session.user.role === "admin") {
        return res.render("admin");
      } else {
        return res.send("You are logged out user!!!");
      }
    } else {
      
      return res.render("Home.ejs");
    }
  });


app.get('/Register',(req,res)=>{
    res.render('Register.ejs');
});

 
app.get('/Login',(req,res)=>{
  res.render('Login.ejs');
});

app.get('/blog',(req,res)=>{
  res.render('blog.ejs',);
});

app.get('/About',(req,res)=>{
  res.render('About.ejs');
});



app.get('/Logout',(req,res)=>{
  req.session.destroy((err)=>{
   if(err){
       console.error("Error destroying session:",err);
       return res.status(500).send("error logging out");
   }
   res.clearCookie('connect.sid');
   res.redirect('/Login');
  });
});

const port=3000;
app.listen(port,()=>{
console.log(`http://lvh.me:${port}`);
});


/*
The POST Method
The POST method of sending data to the server is for large blocks of information.
 The data is sent to the server in the body of the page submission. Only the URL 
 of the script that the data is being sent to appears in the address bar of the 
 browser. You would use the POST method if you’re uploading an image, for example. Examine 
 the example of using the POST method given in Listing 2-2.
Listing 2-2. Applying the POST method of submitting FORM data
<form method="POST" action="/cgi-bin/perlscript.pl" enctype="multipart/form-data" name="photo1">
<input type="FILE" name="photo"></input>
<input type"SUBMIT" value="SUBMIT PHOTO"></submit>
</form>
As you can see from the preceding example, the POST method was used to signify that the data 
is to be sent to the server within the body of the document. Notice also that an enctype 
attribute was used within the form element. This tells the server that a large block of data 
is being sent, in two forms – the data itself and the name of the data, in this case, the file
 name of the photo you’re uploading. The input type is set to FILE. This tells the server that 
 a file is being uploaded. When you are uploading a file, the browser opens a dialog box, 
 within which are the folders and files on the hard drive of your computer. You would select 
 a file and double-click it. It will then be made visible within the text box on the web page.
  Click the Submit button and the file will be uploaded via the Perl upload script named 
  perlscript.pl.
Running Perl CGI Programs
The Perl CGI.pm module is required to be installed within the Perl server for its libraries
 to be made available for use. The source files may be downloaded from CPAN.org in order for 
 you to install the module. The Internet is a vast thing. The CPAN library contains hundreds 
 of thousands of Perl modules in order to work in this vastness.

*/