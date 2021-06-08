const passport = require('passport');
const connection = require('../config/database');
const User = connection.models.User;
const request = require('request');

module.exports = app => {

    app.get('/', function (req, res) {
        let date = new Intl.DateTimeFormat('en-GB', {
            dateStyle: 'full',
            timeStyle: 'long'
        }).format(new Date());

        let expiresmsg = "Token never expires!";
        if (req.isAuthenticated() && req.user.expires_in !== undefined) {
            expiresmsg = "Session expires at : " + new Intl.DateTimeFormat('en-GB', {
                dateStyle: 'full',
                timeStyle: 'long'
            }).format(req.user.expires_in);
        }

        res.render('index', {
            isAuth: req.isAuthenticated(),
            expiresmsg: expiresmsg,
            date_tag: date,
            message_tag: !req.isAuthenticated() ? 'Access your account' : 'Authenticated with ' + req.user.provider,
        });
    });

    app.get('/userinfo', (req, res, next) => {
        if (req.isAuthenticated()) {
            if (req.user.provider === "facebook") {
                res.render('facebookuserinfo', {
                    user: req.user.facebookUser
                });
            } else if (req.user.provider === "google") {
                res.render('googleuserinfo', {
                    user: req.user.googleUser
                });
            } else if (req.user.provider === "github") {
                res.render('githubuserinfo', {
                    user: req.user.githubUser
                });
            }
        }
        else {
            res.redirect('/error');
        }
    });

    app.get('/error', (req, res) => {
        res.render('error', {
            message_tag: 'Authentication error'
        });
    });

    app.get('/logout', (req, res) => {
        req.logout();
        res.redirect('/');
    });

    app.get('/moreinfo/facebook', function (req, res) {

        if (req.user == undefined) {
            res.render('error', {
                message_tag: 'Authentication error'
            });
            return;
        }

        request('https://graph.facebook.com/v10.0/680800373?fields=about,picture,last_name,first_name&access_token=' + req.user.accessToken, function (error, response, body) {

            if (response != undefined && response.statusCode == 200) {
                let data = JSON.parse(body);
                res.render('facebookmoreinfo', {
                    picture: data.picture.data.url,
                    first_name: data.first_name,
                    last_name: data.last_name,
                    id: data.id,
                });
            } else {
                let data = JSON.parse(body);
                res.render('error', {
                    message_tag: data.error.message
                });
            }
        });

    });

    app.get('/moreinfo/github', function (req, res) {

        if (req.user == undefined) {
            res.render('error', {
                message_tag: 'Authentication error'
            });
            return;
        }

        request(
            {
                url: "https://api.github.com/user/emails",
                headers: {
                    'user-agent': 'node.js',
                    "Authorization": "token " + req.user.accessToken
                }
            },
            function (error, response, body) {
                let data = JSON.parse(body);
                if (response != undefined && response.statusCode == 200) {
                    res.render('githubmoreinfo', {
                        email: data[0].email,
                    });
                }
                else {
                    res.render('error', {
                        message_tag: data.message
                    });
                }
            }
        );
    });

    app.get('/moreinfo/google', function (req, res) {

        console.log(req.user.accessToken);

        if (req.user == undefined) {
            res.render('error', {
                message_tag: 'Authentication error'
            });
            return;
        }

        request(
            {
                url: "https://gmail.googleapis.com/gmail/v1/users/112672389575878690864/profile",
                headers: {
                    'user-agent': 'node.js',
                    "Authorization": "Bearer " + req.user.accessToken
                }
            },
            function (error, response, body) {
                let data = JSON.parse(body);
                console.log(data);

                if (response != undefined && response.statusCode == 200) {
                    res.render('googlemoreinfo', {
                        email: data.emailAddress,
                        messagesTotal: data.messagesTotal
                    });
                }
                else {
                    res.render('error', {
                        message_tag: data.error.message
                    });
                }
            }
        );
    });



    app.get('/login/google',
        passport.authenticate('google', {
            scope: ['profile', 'email', 'https://mail.google.com/'],
            accessType: 'offline' // Requests a refresh token
        })
    );

    app.get('/login/facebook',
        passport.authenticate('facebook', {
            scope: ['email', 'user_birthday', 'user_gender', 'user_hometown', 'user_link', 'user_location'],
        })
    );

    app.get('/login/github',
        passport.authenticate('github', {
            scope: ['user:email'],
        })
    );

    app.get('/auth/google/callback',
        passport.authenticate('google', {
            failureRedirect: '/error'
        }),
        function (req, res) {
            res.redirect('/');
        });

    app.get('/auth/facebook/callback',
        passport.authenticate('facebook', {
            failureRedirect: '/error'
        }),
        function (req, res) {
            res.redirect('/');
        });

    app.get('/auth/github/callback',
        passport.authenticate('github', {
            failureRedirect: '/error'
        }),
        function (req, res) {
            res.redirect('/');
        });
};