const send_message = async (phones = [], content) => {
  const payload = JSON.stringify({
    UserName: process.env.SMS_API_USER_NAME,
    Apikey: process.env.SMS_API_KEY,
    MobileNumber: phones.join(','),
    SenderName: '8809601018016',
    TransactionType: 'T',
    Message: content,
  });

  const sended_data = await fetch(
    'https://api.mimsms.com/api/SmsSending/OneToMany',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'bearer',
        Accept: 'application/json',
      },
      body: payload,
    }
  )
    .then((data) => data)
    .catch((err) => console.log('sms errror -> ', err));

  const responseResult = await sended_data.json();
  console.log(responseResult);
  return {
    success: responseResult?.statusCode == '200' ? true : false,
    sended_data: responseResult,
  };
};

module.exports = send_message;
