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
const boxUpdates=async(email,email1,box,data)=>{
  try {
    const subject=`Box Updates for boxid ${box}`
  
    const filename=`views\/boxUpdates.hbs`
    const template=helper(filename)
    const body={
      code:data,
      template
    }
    
    await awsInstance.sendEmail(email,subject,body);
    await awsInstance.sendEmail(email1,subject,body);
  } catch (error) {
    throw new Error(error.message)
  }
             


}



module.exports={forgotPassword,verifyemail,boxUpdates}


