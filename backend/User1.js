class User{
    constructor(username,hashedpassword,role){
        this.username = username;
        this.hashedpassword = hashedpassword;
        this.role = role;
    }
}

module.exports = User;