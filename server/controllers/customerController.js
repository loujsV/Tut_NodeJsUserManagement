/* Customer Router */
const Customer = require('../models/Customer');



// Home
exports.homepage = async(req, res) => {
    const messages = await req.consumeFlash('info');
    const locals = {
        title: 'Users',
        description: 'SCPM Employees'
    }
    
    let perPage = 8;
    let page = req.query.page || 1;

    try {
        const customers = await Customer.aggregate( [ { $sort: { updateAt: -1 } } ] )
        .skip(perPage * page - perPage)
        .limit(perPage)
        .exec();

        const count = await Customer.count();

        res.render('index', {
            locals,
            customers,
            current: page,
            pages: Math.ceil(count / perPage),
            messages
        });


    } catch (error) {
        console.log(error);        
    }
}


// // Home
// exports.homepage = async(req, res) => {
//     const messages = await req.consumeFlash('info');
//         const locals = {
//             title: 'NodeJs',
//             description: 'Free NodeJs User Management System'
//         }

//     try {
//         const customers = await Customer.find({}).limit(22);
//         res.render('index', {locals, messages, customers});

//     } catch (error) {
//         console.log(error);        
//     }
// }

exports.about = async (req, res) => {
    const locals = {
      title: 'About',
      description: 'Free NodeJs User Management System'
    }

    try {
      res.render('about', locals );
    } catch (error) {
      console.log(error);
    }
}



// add Customer form
exports.addCustomer = async(req, res) => {

    const locals = {
        title: 'Add new customer',
        description: 'Free NodeJs User Management System'
    }
    res.render('customer/add', locals);
}

// post Customer form
exports.postCustomer = async(req, res) => {

    try {

        //image adding
    let imageUploadFile;
    let uploadPath;
    let newImageName;

    if(!req.files || Object.keys(req.files).length === 0){
        console.log('No Files where uploaded.');
      } else {
  
        imageUploadFile = req.files.image;
        newImageName = Date.now() + imageUploadFile.name;
  
        uploadPath = require('path').resolve('./') + '/public/uploads/' + newImageName;
  
        imageUploadFile.mv(uploadPath, function(err){
          if(err) return res.status(500).send(err);
        })
  
      }
    

    const newCustomer = new Customer({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        tel: req.body.tel,
        email: req.body.email,
        details: req.body.details,
        image: newImageName
      });

    //   console.log(newCustomer);

        await Customer.create(newCustomer);
        // await newCustomer.save();
        await req.flash('info', 'New employee has been added');
        res.redirect('/');

    } catch (error) {
        console.log(error);
    } 
}

// View Customer form
exports.view = async(req, res) => {

    try {

        const messages = await req.consumeFlash('info');

        const customer = await Customer.findOne({ _id: req.params.id });

        const locals = {
            title: 'Employee Detail',
            description: 'Free NodeJs User Management System'
        };

        res.render('customer/view', {locals, customer, messages});
    } catch (error) {
        console.log(error);
    }
}


// Edit Customer form GET
exports.edit = async(req, res) => {

    try {
        const customer = await Customer.findOne({ _id: req.params.id });

        const locals = {
            title: 'Edit Customer',
            description: 'Free NodeJs User Management System'
        };

        res.render('customer/edit', {locals, customer});
    } catch (error) {
        console.log(error);
    }
    
}

// Edit Customer form PUT
exports.editPost = async(req, res) => {
    try {
        await Customer.findByIdAndUpdate(req.params.id, {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            tel: req.body.tel,
            email: req.body.email,
            details: req.body.details,
            updatedAt: Date.now()
        });

        await res.redirect(`/edit/${req.params.id}`);

    } catch (error) {
        console.log(error);
    } 
}


// Delete Customer Data
exports.deleteCustomer = async(req, res) => {
    try {
        await Customer.deleteOne({_id: req.params.id});

        await res.redirect("/");

    } catch (error) {
        console.log(error);
    } 
}


/* GET 
Search Customer Data */
exports.searchCustomers = async(req, res) => {
    try {

        const locals = {
            title: 'Search Customer',
            description: 'Free NodeJs User Management System'
        };


        let searchTerm = req.body.searchTerm;
        const searchNoSpecialChar = searchTerm.replace(/[^a-zA-Z0-9 ]/g, "");

        const customers = await Customer.find({
            $or: [
                { firstName: { $regex: new RegExp(searchNoSpecialChar, "i")}},
                { lastName: { $regex: new RegExp(searchNoSpecialChar, "i")}},
                { tel: { $regex: new RegExp(searchNoSpecialChar, "i")}},
                { email: { $regex: new RegExp(searchNoSpecialChar, "i")}},
            ]
        });

        res.render("search", {
            customers,
            locals
        })

    } catch (error) {
        console.log(error);
    } 
}