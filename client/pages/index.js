import Link from 'next/link';

const LandingPage=({ currentUser, tickets }) => {

    // Get tickets
    const ticketList=tickets.map(ticket => {
        return (
            <tr key={ticket.id}>
                <td>{ticket.title}</td>
                <td>{ticket.price}</td>
                <td>
                    <Link href="/tickets/[ticketId]" as={`/tickets/${ticket.id}`}>
                        <a className="nav-link">View</a>
                    </Link>
                </td>
            </tr>
        );
    });

    return (
        <div>
            <h1>Tickets</h1>
            <table className="table">
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Price</th>
                        <th>Link</th>
                    </tr>
                </thead>
                <tbody>
                    {ticketList}
                </tbody>
            </table>
        </div>
    );
    // console.log("In LandingPage component");
    //  console.log(tickets);
    // return currentUser? <h1>You are signed in</h1>:<h1>You are NOT signed in</h1>
};

// Next JS will invoke getInitialProps during the server-side (runs on the server) rendering process so if 
//  this component needs some data to render correctly the first time, this method would supply it.
//  This method is typically executed on the server. We can fetch data from this method.
//  This method is called one time.
LandingPage.getInitialProps=async (context, client, currentUser) => {
    // Fetch the list of tickets available
    const { data }=await client.get('/api/tickets');
    console.log("IN getInitialProps");
    if (data) {
        console.log("We have the tickets data");
    }
    return {
        tickets: data
    };
}

export default LandingPage;