import { callHook } from '../../utils/helpers'


export const onCollectionSucceeded = async (event: any) => {
  console.log(event);

  try {
    await callHook(event)
    return;

  } catch (err) {
    // await handleCallBackError(err, baseEvent);
    console.log(err);
    return;
  };
}


export const handler = onCollectionFailed
// .use(validator({ inputSchema }));
