const { expect } = require('chai')
describe("Sample Tests", () => {
    it("Basic sample test 1", () => {
        const varibaletype = typeof ("prashant")
        expect(varibaletype).to.be.a("string")
    });
    it("Basic sample test 2", () => {
        const varibaletype = typeof ({ name: "prashant" })

        expect(varibaletype).to.equals("object")
    });

})