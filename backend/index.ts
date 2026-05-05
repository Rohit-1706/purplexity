import express from "express";

const app = express();

app.post("/purplexity_ask", async (req, res) => {
    // step 1: get the query from the user


    // step 2: make sure the user has access/credits to the endpoint

    
    //step 3: check if the webs search is indexed for a similar query, if so return the indexed result

    
    //step 4: if not, web search to gather results


    // step 5: do some context engineering on the prompt and the web search results to make it more relevant for the model


    // step 6: hit the model with the engineered prompt and stream the response back to the user


    //step 7: also stream back the sources and follow up questions if any
    

    //step 8: close the stream and end the response

})

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});