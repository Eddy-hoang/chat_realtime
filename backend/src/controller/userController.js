export const authMe = async (req, res) => {
    try {
        const user = req.user;// lấy từ authMiddeware
        return res.status(200).json({
            user
        });
    } catch (error) {
        console.error('Error call authMe',error);
        return res.status(500).json({message: "ERROR SYSTEM"});
    }
}