// db.persons.aggregate([
//     {
//         $project: {
//             _id: 0,
//             name: 1,
//             email: 1,
//             gender: 1,
//             birthdate: {
//                 $convert:
//                 {
//                     input: "$dob.date",
//                     to: "date"
//                 },
//             },
//             age: "$dob.age",
//             location: {
//                 type: "Point",
//                 coordinates: [
//                     {
//                         $convert: {
//                             input: "$location.coordinates.longitude",
//                             to: "double"
//                         }
//                     }, {
//                         $convert: {
//                             input: "$location.coordinates.latitude",
//                             to: "double"
//                         }
//                     }]
//             }
//         }
//     },
//     {
//         $project: {
//             gender: 1,
//             email: 1,
//             location: 1,
//             birthdate: 1,
//             age: 1,
//             fullName: {
//                 $concat: [{ $toUpper: { $substrCP: ["$name.first", 0, 1] } },
//                 { $substrCP: ['$name.first', 1, { $subtract: [{ $strLenCP: "$name.first" }, 1] }] },
//                     " ", { $toUpper: { $substrCP: ["$name.last", 0, 1] } }, { $substrCP: ['$name.last', 1, { $subtract: [{ $strLenCP: "$name.last" }, 1] }] }]
//             }
//         }
//     }, {
//         $group:
//         {
//             _id:
//             {
//                 birthYear:
//                 {
//                     $isoWeekYear: "$birthdate"
//                 }
//             }, numPersons: {
//                 $sum: 1
//             }
//         }
//     },
//     {
//         $sort: {
//             numPersons: 1
//         }
//     }
// ]).pretty();



// db.friends.aggregate([
//     {
//         $unwind:"$hobbies"        
//     },
//     {
//         $group: {
//             _id: {
//                 age: "$age"
//             },
//             hobbies: {
//                 $addToSet: "$hobbies"
//             }
//         }
//     }
// ]).pretty()

db.friends.aggregate([
    {
        $unwind: "$examScores"
    },
    {
        $project: {
            _id: 1,
            name: 1,
            age: 1,
            score: "$examScores.score"
        }
    },
    {
        $sort: {
            score: -1
        }
    },
    {
        $group: {
            _id: "$_id",
            maxScore: {
                $max: "$score"
            },
            name: {
                $first: "$name"
            }
        }
    },
    {
        $sort: {
            maxScore: -1
        }
    }
]).pretty()

db.persons.aggregate([
    {
        $bucket: {
            groupBy: "$dob.age",
            boundaries: [18, 23, 35, 45, 50, 65, 75, 120],
            output: {
                numPersons: {
                    $sum: 1
                },
                averageAge: {
                    $avg: "$dob.age"
                },

            }
        }
    }
])
db.persons.aggregate([
    {
        $bucketAuto: {
            groupBy: "$dob.age",
            buckets: 5,
            output: {
                numPersons: {
                    $sum: 1
                },
                averageAge: {
                    $avg: "$dob.age"
                },
            }
        }
    }
])