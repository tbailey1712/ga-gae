# 1 - Hello world


# Simple instructions

1.  Install [Node.js](https://nodejs.org/en/).

    * Optional: Install [Yarn](https://yarnpkg.com/).

1.  Install [git](https://git-scm.com/).
1.  Create a [Google Cloud Platform project](https://console.cloud.google.com).
1.  Install the [Google Cloud SDK](https://cloud.google.com/sdk/).

    * After downloading the SDK, initialize it:

            gcloud init

1.  Clone the repository:

        git clone https://github.com/GoogleCloudPlatform/nodejs-getting-started.git

1.  Change directory:

        cd nodejs-getting-started/1-hello-world

1.  Install dependencies using NPM or Yarn:

    * Using NPM:

            npm install
            npm install googleapis
            npm install --save @google-cloud/datastore
            npm install --save @google-cloud/error-reporting
            npm install --save @google-cloud/trace-agent
            npm install moment --save

    * Using Yarn:

            yarn install

1.  Start the app using NPM or Yarn:

    * Using NPM:

            npm start

    * Using Yarn:

            yarn start

1.  View the app at [http://localhost:8080](http://localhost:8080).

1.  Stop the app by pressing `Ctrl+C`.

1.  Deploy the app:

        gcloud app deploy

1.  View the deployed app at [https://YOUR_PROJECT_ID.appspot.com](https://YOUR_PROJECT_ID.appspot.com).
