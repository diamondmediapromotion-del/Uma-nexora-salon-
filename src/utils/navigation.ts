export const dispatchPopState = () => {
  try {
    window.dispatchEvent(new Event("popstate"));
  } catch (e) {
    const event = document.createEvent('Event');
    event.initEvent('popstate', true, true);
    window.dispatchEvent(event);
  }
};
