import { callHook } from '../../utils/helpers'


export const onCollectionSucceeded = async (event: any) => {
  console.log(event);
  // TODO so basic, see readme for ideas to make it better
  try {
    await callHook(event)
    return;

  } catch (err) {
    // TODO handle that properly
    // await handleCallBackError(err, baseEvent);
    console.log(err);
    return
  };
}


export const handler = onCollectionSucceeded
