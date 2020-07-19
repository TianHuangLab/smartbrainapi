const handleRegister = (req, res, db, bcrypt) => {
    //extract each items from the content of request in JSON format
    const {name, email, password} = req.body;
    if (!email || !name || !password) {
        return res.status(400).json('Incorrect form submission')
    }
    //hash out the password
    const hash = bcrypt.hashSync(password);
    //construct a transaction to ensure the consistency between users & login
    db.transaction(trx => {
        trx.insert({
            hash: hash,
            email: email
        })
        .into('login')
        .returning('email') //retrun the value from column email
        .then(loginEmail => {
            return trx('users') //go to users table
            .returning('*') 
            //select the whole table for inserting the corresponding info
            .insert({
                name: name,
                email: loginEmail[0], //extract the user email from an array
                joined: new Date()
            }).then(user => {
                res.json(user[0]) //respond with json
            })
        })
        .then(trx.commit) //make sure all these changes get added into tables
        .catch(trx.rollback) //in case anything fails, it can rollback
    })
    .catch(err => res.status(400).json('Unable to register'))
}

module.exports = {
    handleRegister: handleRegister
};