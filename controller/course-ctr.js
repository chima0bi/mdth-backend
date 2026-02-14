import Course from "../model/course-model";

export const createCourse = async (req, res) => {
    const { name, description, image, tutor, duration } = req.body;
    if (!name) {
        return res.status(400).json({message: "Please provide course name"})
    }
    const course = await Course.create({
        name, image, description, tutor, duration, isClassOpen: false, 
    })
    res.status(201).json({message: "Course created", course})
};
