import formSubmission from "../model/GenericFormModel";

export const submitForm = async (req, res) => {
  const {
    formName,
    pageUrl,
    fields,
    formCategory,
    formPurpose,
    formTitle,
    submittedWhen,
    status,
  } = req.body;
  try {
    const submission = await formSubmission.create({
      formName,
      pageUrl,
      fields,
        ip: req.ip,
        formCategory,
        formPurpose,
        formTitle,
        submittedWhen,
        status,
      submittedBy: req.user?.id,
      userAgent: req.headers["user-agent"],
    });
    res.status(201).json({ success: true, data: submission });
  } catch (error) {
    res.status(400).json({success: false, error: error.message});
  }
};
