const awsInstance= require('./awsfunctions')
const fs= require('fs');
const path= require('path');


const handlebars= require('handlebars')

const helper=(filename)=>{
  const file= fs.readFileSync(path.join(process.cwd(),filename),'utf8');
  template=handlebars.compile(file);
  return template
}
const forgotPassword= async(email,code)=>{
    try {
        const subject="Forgot Password Code";
        const filename=`views\/forgotPassword.hbs`
         const template=helper(filename)
     const body={
       template,
       code
     }
    await awsInstance.sendEmail(email,subject,body)
    } catch (error) {
        throw new Error(error.message)
    }
    
};
const  verifyemail= async(email,code)=>{
    try {
        const subject="Email Verification Code";
        const filename=`views\/verifyEmail.hbs`
       const template= helper(filename)
     const body={
       template,
       code
     }

    await awsInstance.sendEmail(email,subject,body)
    } catch (error) {
        throw new Error(error.message)
    }

}
const  OrderInfo= async(email,code,courier)=>{
    try {
        const subject=`Your Order details for order # ${code}`;
        const filename=`views\/OrderInfo.hbs`

       const template= helper(filename)
     const body={
       template,
       code,
       courier
     }

    await awsInstance.sendEmail(email,subject,body)
    } catch (error) {
        throw new Error(error.message)
    }

}
const boxUpdates=async(email,subject,code1)=>{
  try {
    const subject1=subject
    const code= code1
    // const code= `There has been an unauthorised access for your box with id ${box}`
    const filename=`views\/boxUpdates.hbs`
    const template=helper(filename)
    const body={
      code,
      template
    }
    
    await awsInstance.sendEmail(email,subject1,body);
    
  } catch (error) {
    throw new Error(error.message)
  }
             


}



module.exports={forgotPassword,verifyemail,boxUpdates,OrderInfo}


