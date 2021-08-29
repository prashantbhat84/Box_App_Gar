const awsInstance= require('./awsfunctions')
const forgotPassword= async(email,code)=>{
    try {
        const subject="Forgot Password Code";
     const body=`
         <h2>Dear Concern,</h2>
           <p>Your code to reset your password is ${code}</p>
                <h3> Warm Regards</h3>
                     <p> Gariyasi Support</p>`

    await awsInstance.sendEmail(email,subject,body)
    } catch (error) {
        throw new Error(error.message)
    }
    
};
const  verifyemail= async(email,code)=>{
    try {
        const subject="Email Verification Code";
     const body=`
         <h2>Dear Concern,</h2>
           <p>Your code to verify your email is ${code}</p>
                <h3> Warm Regards</h3>
                     <p> Gariyasi Support</p>`

    await awsInstance.sendEmail(email,subject,body)
    } catch (error) {
        throw new Error(error.message)
    }

}
const boxUpdates=async(email,email1,box,data)=>{
  try {
    const subject=`Box Updates for boxid ${box}`
    const body=`
    <h2>Dear Concern,</h2>
      <p>${data}</p>
           <h3> Warm Regards</h3>
                <p> Gariyasi Support</p>`
    await awsInstance.sendEmail(email,subject,body);
    await awsInstance.sendEmail(email1,subject,body);
  } catch (error) {
    throw new Error(error.message)
  }
             


}



module.exports={forgotPassword,verifyemail,boxUpdates}


