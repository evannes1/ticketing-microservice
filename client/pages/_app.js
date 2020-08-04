import 'bootstrap/dist/css/bootstrap.css';
import buildClient from '../api/build-client';
import Header from '../components/header';

const AppComponent=({ Component, pageProps, currentUser }) => {

    return (
        <div>
            <Header currentUser={currentUser} />
            <div className="container">
                <Component currentUser={currentUser} {...pageProps} />
            </div>
        </div>
    );

};

// Next JS will invoke getInitialProps during the server-side (runs on the server) rendering process so if 
//  this component needs some data to render correctly the first time, this method would supply it.
//  This method is executed on the server. We can fetch data from this method.
//  This method is called one time.

// This method will be invoked across the application (ie for every page).
AppComponent.getInitialProps=async (appContext) => {

    // Build a client
    const client=buildClient(appContext.ctx);
    const response=await client.get('/api/users/currentuser');
    console.log("resp: ", response.data);
    // Invoke the getInitialProps method from the individual page
    let pageProps={};
    if (appContext.Component.getInitialProps) {
        pageProps=await appContext.Component.getInitialProps(appContext.ctx,
            client, response.data.currentUser);
    }
    // console.log(pageProps);

    return {
        pageProps,
        currentUser: response.data.currentUser
    };

}

export default AppComponent;