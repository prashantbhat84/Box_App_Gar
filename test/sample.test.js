
describe("Sample Tests", () => {
    it("Basic sample test 1", () => {
        const varibaletype = typeof ("prashant")
        expect(varibaletype).toBe("object")
    });
    it("Basic sample test 2", () => {
        const varibaletype = typeof ({ name: "prashant" })

        expect(varibaletype).toBe(varibaletype)
    });

})