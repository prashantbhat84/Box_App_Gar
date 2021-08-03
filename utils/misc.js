function convertToObjectID(id) {
    return new mongoose.Types.ObjectId(id);
}
function convertPhoneToID(phonenumber) {
    const splitVal = phonenumber.split("");

    let packedVal;
    let finalarray = []
    for (let i = 0; i < 10;) {

        packedVal = splitVal[i] + splitVal[i + 1];
        finalarray.push(+packedVal)
        i = i + 2;

    }
    return finalarray
}

module.exports = { convertToObjectID, convertPhoneToID };