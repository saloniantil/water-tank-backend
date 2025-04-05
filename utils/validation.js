import validator from "validator";

const validateSignupData = (req) => {
    const { firstName, lastName, emailId, password } = req.body;
    if (!firstName || !lastName) {
        throw new Error("Name is not valid!");
    }
    else if (!validator.isEmail(emailId)) {
        throw new Error("Email Id not valid!");
    }
    else if (!validator.isStrongPassword(password)){
        throw new Error("Please enter strong password1")
    }
}
export default validateSignupData;