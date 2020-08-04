import { useEffect, useState } from 'react';
import StripeCheckout from 'react-stripe-checkout';
import useRequest from '../../hooks/use-request';
import Router from 'next/router';

const OrderShow=({ order, currentUser }) => {

    const [timeLeft, setTimeLeft]=useState(0);
    const { doRequest, errors }=useRequest({
        url: '/api/payments',
        method: 'post',
        body: {
            orderId: order.order.id
        },
        onSuccess: () => Router.push('/orders')
    });

    useEffect(() => {
        const findTimeLeft=() => {
            const msLeft=new Date(order.order.expiresAt)-new Date();
            setTimeLeft(Math.round(msLeft/1000));
        };
        findTimeLeft();
        const timerId=setInterval(findTimeLeft, 1000);

        return () => {
            clearInterval(timerId);
        }
    }, [order]);
    if (timeLeft<0) {
        return <div>Order Expired</div>
    }

    return (
        <div>
            Time left to pay: {timeLeft} seconds
            <StripeCheckout token={(token) => doRequest({ token: token.id })}
                stripeKey="pk_test_51H8yEzJcm70biFEZm8h2k5mO0DWGS1WMpk9raqyeI77fZwHGj96F20PWY54NZ5vSlIZZxw6Tzni6lzvhV5gBZNfA00qcMOdUys"
                amount={order.order.ticket.price*100}
                email={currentUser.email}
            />
            {errors}
        </div>
    );

};

OrderShow.getInitialProps=async (context, client) => {
    // Get orderId here because whatever we name the file in the square brackets
    //   will be part of the context; the context is queried to get the ID
    const { orderId }=context.query;
    const { data }=await client.get(`/api/orders/${orderId}`);
    //console.log("OrderShow.getInitialProps: Resp data: ", response.data);
    //console.log("OrderShow.getInitialProps: Order id: ", response.data.id);

    return { order: data };
}

export default OrderShow;