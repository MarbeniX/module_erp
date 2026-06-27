import "dotenv/config";
import colors from "colors";
import server from "./server";

const port = parseInt(process.env.PORT || "5000", 10);

server.listen(port, () => {
    console.log(colors.magenta(`Server running on port: ${port}`));
});
