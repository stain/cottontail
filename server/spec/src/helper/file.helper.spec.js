'use strict';
var FileHelper = require('../../../src/helper/file.helper');

describe("FileHelper", () => {

    describe("relativeToAbsolutePath()", () => {

        it("should convert a relative path to an absolute", () => {
            let result1 = FileHelper.relativeToAbsolutePath("./asd.json", "/Users/mate/testws/");
            expect(result1).toEqual("/Users/mate/testws/asd.json");

         let result2 = FileHelper.relativeToAbsolutePath("asd.json", "/Users/mate/testws/");
            expect(result2).toEqual("/Users/mate/testws/asd.json");

            let result3 = FileHelper.relativeToAbsolutePath("../../asd.json", "/Users/mate/testws/");
            expect(result3).toEqual("/Users/asd.json");
        });

    });

    describe("isRelativePath()", () => {
        it("return true if a path begins with './' or '../'", () => {

            expect(FileHelper.isRelativePath("./test.json")).toBe(true);
            expect(FileHelper.isRelativePath("../../test.json")).toBe(true);

            expect(FileHelper.isRelativePath("test.json")).toBe(false);
        });
    });
});