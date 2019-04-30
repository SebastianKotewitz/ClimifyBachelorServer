const KnnManager = require("../../models/knnManager");
const chai = require('chai');
const expect = chai.expect;
chai.use(require('chai-as-promised'));
const IllegalArgumentError = require("../../errors/IllegalArgumentError");

describe("KNN algorithm manager", () => {

    let knnManager;
    let dimension;
    let k;
    let initialPoints;
    beforeEach(() => {
        k = 2;
        dimension = 2;
        initialPoints = [{
            type: "0",
            vector: [10, 20]
        }, {
            type: "1",
            vector: [20, 10]
        }, {
            type: "2",
            vector: [30, 5]
        }];
        knnManager = new KnnManager(dimension, initialPoints, k)
    });

    describe("Initialization", () => {

        let dimensions;
        let initialPoints;
        let k;
        const exec = () => {
            return new KnnManager(dimensions, initialPoints, k);
        };

        beforeEach(() => {
            dimensions = 2;
            initialPoints = [
                {type: "0", vector: [10, 20]},
                {type: "1", vector: [20, 10]}
            ];
            k = 2;
        });


        it("Should throw error if type is not a string", () => {
            initialPoints[0].type = 2;
            expect(exec).to.throw(IllegalArgumentError)
        });
        it("Should throw error if dimensions below 1", () => {
            dimensions = 0;
            expect(exec).to.throw(IllegalArgumentError)
        });

        it("Should throw error if some of the points did not have correct dimension", () => {
            initialPoints.push({type: 2, vector: [15]});
            expect(exec).to.throw(IllegalArgumentError);
        });

        it("Should throw error if initial points is not at least one-length array", () => {
            initialPoints = [];
            expect(exec).to.throw(IllegalArgumentError);
        });

        it("Should throw error if an initial point did not have both id and vector array", () => {
            initialPoints = [{type: 0, vector: undefined}];
            expect(exec).to.throw(IllegalArgumentError);
        });

        it("Should throw error if id of a point is not set", () => {
            initialPoints.push({type: undefined, vector: [10]});
            expect(exec).to.throw(IllegalArgumentError);
        });

        it("Should set points array if provided correct input", () => {
            const knnManager = exec();
            expect(knnManager.points).to.equal(initialPoints);
        });

        it("Should not throw error even when vector with 0 value was parsed ", () => {
            initialPoints.push({type: "2", vector: [0, 0]});
            const knnManager = exec();
            expect(knnManager.points).to.equal(initialPoints);
        });

        it("Should throw if k was not set to a value above 0", () => {
            k = 0;
            expect(exec).to.throw(IllegalArgumentError);
        });

        it("Should have points to at least the amount of k ", () => {
            k = 3;
            expect(exec).to.throw(IllegalArgumentError);
        });
    });

    describe("Calculate euclidean distance between two points", () => {

        let point1;
        let point2;

        beforeEach(() => {
            point1 = {
                type: 2,
                vector: [1, 2]
            };
            point2 = {
                type: 1,
                vector: [5, 5]
            };
        });
        const exec = () => {
            return knnManager.calcDist(point1, point2)
        };
        it("Should throw error if the one of the two points do not have the correct dimension", () => {
            point1.vector.push(3);
            expect(exec).to.throw(IllegalArgumentError)
        });

        it("Should calculate distance", () => {
            const distance = exec();
            expect(distance).to.equal(5);
        });

        it("Should also calculate distance in 3 dimensions", () => {
            knnManager.dimension = 3;
            point1.vector = [1, 2, 3];
            point2.vector = [1, 6, 6];
            const distance = exec();
            expect(distance).to.equal(5);
        });
    });

    describe("Find nearest neighbors", () => {
        let newPoint;

        const exec = () => {
            return knnManager.nearestNeighbors(newPoint, knnManager.points, knnManager.k)
        };

        beforeEach(() => {
            newPoint = {
                type: 1,
                vector: [29, 6]
            }
        });

        it("Should return array of length 2", () => {
            const res = exec();
            expect(res.length).to.equal(2);
        });

        it("Should consist of the the 2 closest neighbors", () => {
            const res = exec();

            expect(res.filter(elem => elem.type === initialPoints[2].type).length).to.equal(1);
            expect(res.filter(elem => elem.type === initialPoints[1].type).length).to.equal(1);

        });
    });

    describe("Find point with maximum distance to new point", () => {
        let points;
        let newPoint;

        beforeEach(() => {
            points = [{
                type: 0,
                vector: [10, 20]
            }, {
                type: 1,
                vector: [3, 4]
            }, {
                type: 2,
                vector: [50, 10]
            }];

            newPoint = {
                type: 4,
                vector: [50,50]
            }
        });

        const exec = () => {
            return knnManager.maxDistance(newPoint, points);
        };

        it("Should estimate the right point to be at max distance", () => {
            expect(exec().index).to.equal(1);
        });
    });

    describe("Find closest point index and distance", () => {
        let newPoint;
        let points;

        beforeEach(() => {
            newPoint = {
                type: 0,
                vector: [1, 2, 3]
            };

            points = [{
                type: 1,
                vector: [0, 2, 1]
            }, {
                type: 2,
                vector: [10, 2, 5]
            }, {
                type: 3,
                vector: [-1, 22, -3]
            }]
        });

        const exec = () => {
            return knnManager.minDistPoint(newPoint, points);
        };

        it("Should return index of min distance point", () => {
            knnManager.dimension = 3;
            expect(exec().index).to.equal(0);
        });
    });

    describe("Check if point has valid type", () => {
        let newPoint;
        const exec = () => {
            return knnManager.checkPointType(newPoint)
        };

        beforeEach(() => {
            newPoint = {type: "0"}
        });

        it("Should throw error if type is not valid", () => {
            newPoint.type = "233";
            expect(exec).to.throw(IllegalArgumentError);
        });

        it("Should not throw error if type is valid (set in initialPoints) ", () => {
            expect(exec).to.not.throw(IllegalArgumentError);
        });

    });

    describe("Estimate point type ", () => {
        let newPoint;
        const exec = () => {
            return knnManager.estimatePointType(newPoint);
        };
        beforeEach(() => {
            newPoint = {
                vector: [18,12]
            }
        });

        it("Should throw error if point type was already set", () => {
            newPoint.type = "0";
            expect(exec).to.throw(IllegalArgumentError)
        });

        it("Should return the point type with minimal distances if the nearest points have different types", () => {
            const pointType = exec();
            expect(pointType).to.equal(initialPoints[1].type.toString());
        });

        it("Should return type that most nearest points has", () => {
            initialPoints.push({
                type: "1",
                vector: [18, 12]
            });
            const res = exec();
            expect(res).to.equal("1");
        });

    });
});

