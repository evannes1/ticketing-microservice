import useRequest from '../../hooks/use-request';
import Router from 'next/router';


// Here 'ticket' is set by getInitialProps on the server
/// Also remember that the currentUser prop comes into this component as well
const TicketShow=({ ticket }) => {
    console.log("IN TicketShow, ticket:", ticket);
    const { doRequest, errors }=useRequest({
        url: '/api/orders',
        method: 'post',
        body: {
            ticketId: ticket.id
        },
        onSuccess: (order) => Router.push('/orders/[orderId]', `/orders/${order.id}`)
    });

    return (
        <div>
            <h1>{ticket.title}</h1>
            <h4>Price: {ticket.price}</h4>
            {errors}
            <button onClick={() => doRequest()} className="btn btn-primary">Purchase</button>
        </div>
    );
};

TicketShow.getInitialProps=async (context, client) => {
    // Get ticketId here because whatever we name the file in the square brackets
    //   will be part of the context; the context is queried to get the ID
    const { ticketId }=context.query;
    const { data }=await client.get(`/api/tickets/${ticketId}`);
    console.log("IN ticketId.getInitialProps", data);
    return { ticket: data };
}

export default TicketShow;