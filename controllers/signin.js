const handleSignin = (req, res, db, bcrypt) => {
    const {email, password} = req.body;
    if (!email || !password) {
        return res.status(400).json('Incorrect form submission')
    }
    //find the user who is logging from the database
    db.select('email','hash').from('login')
    .where('email','=', email)
    .then(data => {
        //check if user's password is correct
        const isValid = bcrypt.compareSync(password, data[0].hash);
        if (isValid) {
            //if it's correct, it returns the user info from table users as response
            return db.select('*').from('users')
            .where('email','=',email)
            .then(user => {
                res.json(user[0])
            })
            .catch(err => res.status(400).json('Unable to get user'))
        } else {
            res.status(400).json('Wrong credentials')
        }
    })
    .catch(err => res.status(400).json('Unable to get user'))
}

module.exports = {
    handleSignin: handleSignin
}