var express = require('express');
var path = require('path');

var bodyParser = require('body-parser');
var logger = require('morgan');
var bcrypt = require('bcrypt');
var multer = require('multer');
var mysql = require('mysql');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var generator = require('generate-password');
var flash = require('connect-flash');

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "im_locale"
});


var app = express();

app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.resolve(__dirname, 'public')));

var multipartUpload = multer({storage: multer.diskStorage({
    destination: function (req, file, callback) { callback(null, 'public/uploads');},
    filename: function (req, file, callback) { callback(null, file.fieldname + '-' + Date.now());}})
}).single('image');

app.post('/webservice',multipartUpload, function (req, res, err) { 

	//// Signup

  var action = req.body.action;

 if (req.file == undefined) 
 {
     req.file = '';
 }
  //console.log(action);

	if(action == "signup")
	{
  bcrypt.hash(req.body.password, 5, function( err, bcryptedPassword) {

    
	  var users={ user_name: req.body.user_name,
                first_name: req.body.first_name,
                last_name: req.body.last_name,
                email: req.body.email,
                password: bcryptedPassword,
                address: req.body.address,
                image: req.file.path
              };


   
          console.log(users);    
	   var email = req.body.email;
     var user_name = req.body.user_name;
	       //console.log(email);
      	con.query('SELECT * FROM users WHERE email = ?' ,  [email],function(err,rows){
    		if(err) 
    		{
        		//con.end();
        		return console.log(err);
   			}

        if (rows.length)
        {
          res.json({
                  msg: "email already exist",
                  status: "0"
                  });
        }
        else
        {
 
            con.query('SELECT * FROM users WHERE user_name = ?' ,  [user_name],function(err,row){
              if(row.length)
              {
                res.json({
                  msg: "username already exist",
                  status: "0"
                  });
              }

              else
              {

  	// res.end();
    //	con.connect(function(err) {
  	//if (err) throw err;
  	//console.log("Connected!");
   
  		 var query = con.query('INSERT INTO users SET ?', users, function (error, results, fields) {
    	 if (error) throw error;
    	console.log("1 record inserted");
      res.json({
                  msg: "inserted",
                  user_id: results.insertId,
                  status: "1"
                  }); 
  		});
	//});


	  }

  });
      }
    
	   });
        });
    }


    //// Login

    if(action == "login")
    {
    	var email = req.body.email;
    	var password = req.body.password;

    	var query=con.query('SELECT * FROM users WHERE email = ?' ,  [email],function(err,rows){
    		if(err) 
    		{
        		//con.end();
        		return console.log(err);
   			}

   		if (rows.length >0)     
    	{
        bcrypt.compare(password, rows[0].password, function(err, doesMatch){
          if (doesMatch)
          {
    		    console.log(rows);
            console.log(rows[0].password);
    	
    		   res.json({
                  msg: "login successfully",
                  data: rows,
                  status: "1"
                  });
          }
      else
      {
        res.json({
                  msg: "wrong email or password",
                  status: "0"
                  });
      }
      });
    	}

    	
   		});
    }


    ////Update
   
    if(action == "update_profile")
    {
    	var user_id = req.body.user_id;
    	var user_name = req.body.user_name;
      var first_name = req.body.first_name;
      var last_name = req.body.last_name;
    	var email = req.body.email;
    	var address = req.body.address;
      var image = req.file.path;


       con.query('SELECT * FROM users WHERE email = ?' ,  [email],function(err,result){
        if(err) 
        {
            //con.end();
            return console.log(err);
        }

        if (result.length)
        {
          res.json({
                  msg: "email already exist",
                  status: "0"
                  });
        }


        else
        {
 
            con.query('SELECT * FROM users WHERE user_name = ?' ,  [user_name],function(err,row){
              if(row.length)
              {
               res.json({
                  msg: "username already exist",
                  status: "0"
                  });
              }

              else
              {  


      var query=con.query('SELECT * FROM users WHERE user_id = ?' ,  [user_id],function(err,rows){

        if(req.body.user_name == '')
          {user_name = rows[0].user_name;}

        if(req.body.first_name == '')
          {first_name = rows[0].first_name;}

        if(req.body.last_name == '')
          {last_name = rows[0].last_name;}

        if(req.body.email == '')
          {email = rows[0].email;}

        if(req.body.address == '')
          {address = rows[0].address;}

        if(req.file == '')
          {image = rows[0].image;}


             
 
    	var query=con.query('UPDATE users SET user_name = ?, first_name = ?, last_name=?, email = ?, address = ?, image = ? WHERE user_id = ?' ,  [user_name, first_name, last_name, email , address, image, user_id], function(err,rows){
    		if(err) 
    		{
        		//con.end();
        		return console.log(err);
   			}

   		if (rows.length)     
    	{
    		
    		res.json({
                  msg: "not updated",
                  status: "0"
                  });

    	}

    	else
    	{
    		res.json({
                  msg: "updated",
                  status: "1"
                  });
    	}
   		});
    });
    }
  });
          }
        });

}

    //// GET   PROFILE

    //var view = req.body.view;
    if (action == "get_profile")
    {
      var user_id = req.body.user_id;

    	//var query=con.query('SELECT users.*, payment_method.* FROM users INNER JOIN payment_method ON users.user_id = payment_method.user_id WHERE users.user_id=? ',[user_id],function(err,rows){
        var query = con.query('SELECT * FROM users WHERE user_id =?',[user_id],function(err,rows){
    		if(err) 
    		{
        		//con.end();
        		return console.log(err);
   			}

   			if (rows.length)     
    	{

         var query = con.query('SELECT * FROM payment_method WHERE user_id =?',[user_id],function(err,row){
    		
    		  res.json({
                  msg: "success",
                  users: rows,
                  payment_method: row,
                  status: "1"
                  });

      });

    	}

    	else
    	{
    		res.json({
                  msg: "failed",
                  status: "0"
                  });
    	}
   		});
    }

      //// ADD REQUESTS

      if(action == "add_requests")
      {

        var requests={ user_id: req.body.user_id,
                request_title: req.body.request_title,
                image: req.file.path,
                price: req.body.price,
                category: req.body.category,
                description: req.body.description,
                currency: req.body.currency,
                latitude: req.body.latitude,
                longitude: req.body.longitude,
                item_location: req.body.item_location,
                required_time: req.body.required_time,
                delievery_type: req.body.delievery_type,
                commision: req.body.commision,
                transport_stipend: req.body.transport_stipend
              };

              var query = con.query('INSERT INTO requests SET ?', requests, function (error, results) {
       if (error) throw error;
      console.log("1 record inserted"); 

         res.json({
                  msg: "inserted",
                  request_id: results.insertId,
                  status: "1"
                  });

      });

              
               
      }


      //// GET REQUESTS

      if(action == "get_requests")
      {
         var request_id = req.body.request_id;

      var query=con.query('SELECT * FROM requests WHERE request_id = ?', [request_id],function(err,rows){
        if(err) 
        {
            //con.end();
            return console.log(err);
        }

        if (rows.length)     
      {
        
        res.json({
                  msg: "success",
                  data: rows,
                  status: "1"
                  });

      }

      else
      {
        res.json({
                  msg: "failed",
                  status: "0"
                  });

      }
      });
      }


      //// ADD RATINGS

      if(action == "add_ratings")
      {
        var ratings={ request_id: req.body.request_id,
                buyer_id: req.body.buyer_id,
                shopper_id: req.body.shopper_id,
                rating: req.body.rating,
                comments: req.body.comments
              };
              console.log(ratings)
              var query = con.query('INSERT INTO ratings SET ?', ratings, function (error, results) {
       if (error) throw error;
      console.log("1 record inserted"); 

       res.json({
                  msg: "inserted",
                  rating_id: results.insertId,
                  status: "1"
                  });

      });              

      }

      //// REQUESTS STATUS


      if(action == "request_status")
      {
          var status={ request_id: req.body.request_id,
                status: req.body.status,
                assigned_to: req.body.assigned_to
                };

                 var query = con.query('INSERT INTO request_status SET ?', status, function (error, results) {
       if (error) throw error;
      console.log("1 record inserted"); 

       res.json({
                  msg: "inserted",
                  id: results.insertId,
                  status: "1"
                  });

      });              
      }


      //// FRIENDSHIP


      if (action == "friendship")
      {
          var friendship={ user_id: req.body.user_id,
                            friend_id: req.body.friend_id,
                            status: req.body.status
              
                };

                 var query = con.query('INSERT INTO friendship SET ?', friendship, function (error, results) {
       if (error) throw error;
      console.log("1 record inserted"); 

       //res.write(results.insertId);
      res.json({
                  msg: "inserted",
                  id: results.insertId,
                  status: "1"
                  });

     });
      }



      //// PAYMENT METHOD


      if (action == "payment_method")
      {
        var payment_method={ user_id: req.body.user_id,
                            card_type: req.body.card_type,
                            name_on_card: req.body.name_on_card,
                            card_number: req.body.card_number,
                            expiry: req.body.expiry
              
                };

                var query = con.query('INSERT INTO payment_method SET ?', payment_method, function (error, results) {
       if (error) throw error;
      console.log("1 record inserted"); 

       res.json({
                  msg: "inserted",
                  id: results.insertId,
                  status: "1"
                  });

      });              
      }

      


      //// DELIEVERY ADDRESS

      if (action == "delievery_address")
      {
         var delievery_address={ user_id: req.body.user_id,
                            full_name: req.body.full_name,
                            address1: req.body.address1,
                            address2: req.body.address2,
                            city: req.body.city,
                            postcode: req.body.postcode,
                            contact: req.body.contact              
                };

              var query = con.query('INSERT INTO delievery_address SET ?', delievery_address, function (error, results) {
       if (error) throw error;
      console.log("1 record inserted"); 

       res.json({
                  msg: "inserted",
                  id: results.insertId,
                  status: "1"
                  });

      });          
      }



      //// APPLICATION

      if(action == "application")
      {
         var application={ request_id: req.body.request_id,
                            applicant_id: req.body.applicant_id,
                            status: req.body.status
              
                };

                 var query = con.query('INSERT INTO application SET ?', application, function (error, results) {
       if (error) throw error;
      console.log("1 record inserted"); 

       //res.write(results.insertId);
       res.json({
                  msg: "inserted",
                  id: results.insertId,
                  status: "1"
                  });
     });
      }



      //// CONTACT US

      if (action == "contact_us")
      {
        var contact_us={ user_id: req.body.user_id,
                          message: req.body.message
                                     
                };

                 var query = con.query('INSERT INTO contact_us SET ?', contact_us, function (error, results) {
       if (error) throw error;
      console.log("1 record inserted"); 

       //res.write(results.insertId);
       res.json({
                  msg: "inserted",
                  id: results.insertId,
                  status: "1"
                  });
     });
      }


      //// DELETE USER

      if (action == "delete_user")
      {
         var user_id = req.body.user_id;


         var query=con.query('UPDATE users SET is_delete = 1 WHERE user_id=?' ,  [user_id], function(err,rows){
        if(err) 
        {
            //con.end();
            return console.log(err);
        }

      if (rows.length)     
      {
        
        res.json({
                  msg: "not deleted",
                  status: "0"
                  });

      }

      else
      {
        res.json({
                  msg: "deleted",
                  status: "1"
                  });
      }
      });
      }


      //// CHANGE PASSWORD

      if(action == "change_password")
      {
        bcrypt.hash(req.body.new_password, 5, function( err, bcryptedPassword) {
        var user_id = req.body.user_id;
        var old_password = req.body.old_password;
        var new_password = bcryptedPassword;

        var query = con.query('SELECT * FROM users WHERE user_id=? ', [user_id], function(err,rows){
          if (rows.length >0)     
      {
        bcrypt.compare(old_password, rows[0].password, function(err, doesMatch){
          if (doesMatch)
          {
            var query = con.query('UPDATE users SET password = ? WHERE user_id = ?', [new_password, user_id], function(err,row){
              if(row.length>0)
              {
                res.json({
                  msg: "not updated",
                  status: "0"
                  }); 
              }
              else
              {
                res.json({
                  msg: "updated",
                  status: "1"
                  });
              }
            })
          }
      else
      {
       res.json({
                  msg: "wrong old password",
                  status: "0"
                  });
      }
      });
      }  
    });
        }); 
      }


       //// FORGOT PASSWORD

       if(action == "forgot_password")
       {
        var email = req.body.email;
        var password = generator.generate({
                                         length: 6,
                                         numbers: true
                                        });

         bcrypt.hash(password, 5, function( err, bcryptedPassword) {
                var hash_password = bcryptedPassword;

          //console.log(password);
        var transport = nodemailer.createTransport( {
                                              service: 'gmail',
                                                auth: {
                                                        user: "voomerapp@gmail.com",
                                                         pass: "voomer@123"
                                                      }
                                                          });

        var query = con.query('SELECT * FROM users WHERE email = ?', [email], function(err,rows){
          if (rows.length >0)
          {
              
              var message = {
                              from: 'voomerapp@gmail.com',
                              to: rows[0].email ,
                              subject:"Temporary Password" ,
                              text: "Your temporary account password is:\n" + password 
                            };

              console.log('Sending Mail');

              transport.sendMail(message, function(err,send) {
              if (err) { console.log(err); }
                   if(send)
                  {
                  var query = con.query('UPDATE users SET password =? WHERE email = ?', [hash_password, email], function(err,row){
                      if (!row.length){
                        console.log("password updated");
                      }
                  });
                 
                    console.log('Success!');
              res.json({
                  msg: "password sent",
                  status: "1"
                  });
              
            }
            else
            {
              res.json({
                  msg: "password not sent",
                  status: "0"
                  });
              console.log('Failed!');
            }
              });
            }
          });
      });
       }

 
      

    

  });

app.listen(process.env.PORT || 3000, process.env.IP || '0.0.0.0' );