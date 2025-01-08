# LLM-API
A sample project that provides a REST API allowing to configure and interact with LLM models provided by the [LangChain](https://js.langchain.com/docs/introduction/) framework.  

The application shows also the dependency injection principles application using the excellent [awilix](https://github.com/jeffijoe/awilix) DI library.

### Installation

Clone the repository
Open the folder with the cloned repository in command line.  
Run `npm install`

### Install development MongoDB container
Run  
`docker run --name mongo-genai -d -p 27017:27017 -v c:/projects/genai/mongo-data:/data/db -d mongo`
The folder points to the volume mapped to the container data foler. This allows to persist data between restarts of the container. Change the folder to your preferred location.

When you have the container set up, you can stop it by running `docker stop mongo-genai` and start it by running `docker start mongo-genai`

**Note** - On Windows, Docker desktop applicaiton must be configured and running.
