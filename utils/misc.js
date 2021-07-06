function convertToObjectID(id) {
    return new mongoose.Types.ObjectId(id);
}

module.exports = { convertToObjectID };