const passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var GitHubStrategy = require('passport-github').Strategy;


// Get the configuration values
dotenv = require('dotenv');
dotenv.config();
const connection = require('../config/database');
const User = connection.models.User;
const FacebookUser = connection.models.FacebookUser;
const GoogleUser = connection.models.GoogleUser;
const GithubUser = connection.models.GithubUser;

/*
 * After a successful authentication, store the user in the session
 * as req.session.passport.user so that it persists across accesses.
 * See: https://stackoverflow.com/questions/27637609/understanding-passport-serialize-deserialize
 * Here, since no database is used, the full user profile has to be stored in the session.
 */

passport.serializeUser((user, done) => {
    done(null, user);
});

/*
* On each new access, retrieve the user profile from the session and provide it as req.user
* so that routes detect if there is a valid user context. 
*/

passport.deserializeUser((user, done) => {
    User.findOne({provider : user.provider})
    .then((dbuser) => {
        done(null, dbuser);
    })
    .catch(err => done(err))
});


/*  Google AUTH  */

passport.use(
    new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL
    }, (accessToken, refreshToken, profile, done) => {


        User.deleteMany({ provider: "google" }, function (err) {
            if (err) done(err);

            const newGoogleUser = new GoogleUser({
                sub: profile._json.sub,
                name: profile._json.name,
                given_name: profile._json.given_name,
                family_name: profile._json.family_name,
                picture: profile._json.picture,
                email: profile._json.email,
                email_verified: profile._json.email_verified,
                locale: profile._json.locale,
            });
    
            const newUser = new User({
                provider : "google",
                googleUser:newGoogleUser,
                accessToken: accessToken,
                refreshToken: refreshToken,
                expires_in: new Date(new Date().setHours(new Date().getHours() + 1))
            });
    
            newUser.save().then((user) => {
                return done(null, user);
            }).catch((err) => {
                done(err);   
            });
        });
    }
    )
);


passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: process.env.FACEBOOK_CALLBACK_URL
  }, (accessToken, refreshToken, profile, done) => {

    User.deleteMany({ provider: "facebook" }, function (err) {
        if (err) done(err);

        const newFacebookUser = new FacebookUser({
            id: profile._json.id,
            name: profile._json.name,
        });
    
        const newUser = new User({
            facebookUser:newFacebookUser,
            accessToken: accessToken,
            refreshToken: refreshToken,
            provider : "facebook",
            expires_in: new Date(new Date().setHours(new Date().getHours() + 1))
        });
        newUser.save().then((user) => {
                return done(null, user);
            }).catch((err) => {
                done(err);   
            });
    });

   
}
)
);


passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_APP_ID,
    clientSecret: process.env.GITHUB_APP_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK_URL
  }, (accessToken, refreshToken, profile, done) => {

    User.deleteMany({ provider: "github" }, function (err) {
        if (err) done(err);

        const newGithubUser = new GithubUser({
            login:profile._json.login,
            id:profile._json.id,
            node_id:profile._json.node_id,
            avatar_url:profile._json.avatar_url,
            gravatar_id:profile._json.gravatar_id,
            url:profile._json.url,
            html_url:profile._json.html_url,
            followers_url:profile._json.followers_url,
            following_url:profile._json.following_url,
            gists_url:profile._json.gists_url,
            starred_url:profile._json.starred_url,
            subscriptions_url:profile._json.subscriptions_url,
            organizations_url:profile._json.organizations_url,
            repos_url:profile._json.repos_url,
            events_url:profile._json.events_url,
            received_events_url:profile._json.received_events_url,
            type:profile._json.type,
            site_admin:profile._json.site_admin,
            name:profile._json.name,
            company:profile._json.company,
            blog:profile._json.blog,
            location:profile._json.location,
            email:profile._json.email,
            hireable:profile._json.hireable,
            bio:profile._json.bio,
            twitter_username:profile._json.twitter_username,
            public_repos:profile._json.public_repos,
            public_gists:profile._json.public_gists,
            followers:profile._json.followers,
            following:profile._json.following,
            created_at:profile._json.created_at,
            updated_at:profile._json.updated_at,
        });
    
        const newUser = new User({
            githubUser:newGithubUser,
            accessToken: accessToken,
            refreshToken: refreshToken,
            provider : "github",
            expires_in: new Date(new Date().setHours(new Date().getHours() + 1))
        });
    
        newUser.save().then((user) => {
                return done(null, user);
            }).catch((err) => {
                done(err);   
            });
    });

 
}
)
);