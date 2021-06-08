const mongoose = require('mongoose');

require('dotenv').config();

/**
 * -------------- DATABASE ----------------
 */

/**
 * Connect to MongoDB Server using the connection string in the `.env` file.  To implement this, place the following
 * string into the `.env` file
 * 
 * DB_STRING=mongodb://<user>:<password>@localhost:27017/database_name
 */

const dbString = process.env.DB_STRING;
const dbOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true
}

const connection = mongoose.createConnection(dbString, dbOptions);


const GoogleUserSchema = new mongoose.Schema({ 
    sub: String,
    name: String,
    given_name: String,
    family_name: String,
    picture: String,
    email: String,
    email_verified: String,
    locale: String
});

const FacebookUserSchema = new mongoose.Schema({ 
    id:String,
    name:String 
});

const GithubUserSchema = new mongoose.Schema({ 
    login:String,
    id:String,
    node_id:String,
    avatar_url:String,
    gravatar_id:String,
    url:String,
    html_url:String,
    followers_url:String,
    following_url:String,
    gists_url:String,
    starred_url:String,
    subscriptions_url:String,
    organizations_url:String,
    repos_url:String,
    events_url:String,
    received_events_url:String,
    type:String,
    site_admin:String,
    name:String,
    company:String,
    blog:String,
    location:String,
    email:String,
    hireable:String,
    bio:String,
    twitter_username:String,
    public_repos:String,
    public_gists:String,
    followers:String,
    following:String,
    created_at:String,
    updated_at:String,
});


// Creates simple schema for a User.  The hash and salt are derived from the user's given password when they register
const UserSchema = new mongoose.Schema({
    googleUser : GoogleUserSchema, 
    facebookUser : FacebookUserSchema, 
    githubUser : GithubUserSchema,
    accessToken: String,
    refreshToken: String,    
    expires_in: Date,
    provider: String   
});


const User = connection.model('User', UserSchema);
const FacebookUser = connection.model('FacebookUser', FacebookUserSchema);
const GoogleUser = connection.model('GoogleUser', GoogleUserSchema);
const GithubUser = connection.model('GithubUser', GithubUserSchema);

// Expose the connection
module.exports = connection;
