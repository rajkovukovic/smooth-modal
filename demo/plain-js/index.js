import { SmoothModal } from "../lib/smooth-modal.js";

window.SmoothModal = SmoothModal;

const lorem =
  ` Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet. Duis sagittis ipsum. Praesent mauris. Fusce nec tellus sed augue semper porta. Mauris massa. Vestibulum lacinia arcu eget nulla. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. 
    Curabitur sodales ligula in libero. Sed dignissim lacinia nunc. Curabitur tortor. Pellentesque nibh. Aenean quam. In scelerisque sem at dolor. Maecenas mattis. Sed convallis tristique sem. Proin ut ligula vel nunc egestas porttitor. Morbi lectus risus, iaculis vel, suscipit quis, luctus non, massa. Fusce ac turpis quis ligula lacinia aliquet. Mauris ipsum. Nulla metus metus, ullamcorper vel, tincidunt sed, euismod in, nibh. Quisque volutpat condimentum velit. 
    Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Nam nec ante. Sed lacinia, urna non tincidunt mattis, tortor neque adipiscing diam, a cursus ipsum ante quis turpis. Nulla facilisi. Ut fringilla. Suspendisse potenti. Nunc feugiat mi a tellus consequat imperdiet. Vestibulum sapien. Proin quam. Etiam ultrices. Suspendisse in justo eu magna luctus suscipit. Sed lectus. Integer euismod lacus luctus magna. Quisque cursus, metus vitae pharetra auctor, sem massa mattis sem, at interdum magna augue eget diam. 
    Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Morbi lacinia molestie dui. Praesent blandit dolor. Sed non quam. In vel mi sit amet augue congue elementum. Morbi in ipsum sit amet pede facilisis laoreet. Donec lacus nunc, viverra nec, blandit vel, egestas et, augue. Vestibulum tincidunt malesuada tellus. Ut ultrices ultrices enim. Curabitur sit amet mauris. Morbi in dui quis est pulvinar ullamcorper. Nulla facilisi. Integer lacinia sollicitudin massa. 
    Cras metus. Sed aliquet risus a tortor. Integer id quam. Morbi mi. Quisque nisl felis, venenatis tristique, dignissim in, ultrices sit amet, augue. Proin sodales libero eget ante. Nulla quam. Aenean laoreet. Vestibulum nisi lectus, commodo ac, facilisis ac, ultricies eu, pede. Ut orci risus, accumsan porttitor, cursus quis, aliquet eget, justo. Sed pretium blandit orci. Ut eu diam at pede suscipit sodales. Aenean lectus elit, fermentum non, convallis id, sagittis at, neque. Nullam mauris orci, aliquet et, iaculis et, viverra vitae, ligula.`;

let counter = 1;

document.getElementById("nested-modals-button").onclick = () => {
  const showOneMoreModal = (canHaveSufix = false) => {
    const sufix = canHaveSufix && Math.random() < 0.5 ? lorem : "";
    SmoothModal.alert({
      ok_button_label: "OK",
      message: Math.round(Math.random() * 1000) + sufix,
      title: "Alert " + counter++,
      onResponse: handleModalResponse,
    });
  };

  const handleModalResponse = ({ action }) => {
    console.log({ action });
  };

  for (let i = 0; i < 10; i++) {
    showOneMoreModal(true);
  }
};

document.getElementById("conditionals-modals-button").onclick = () => {
  function showMustAcceptModal() {
    SmoothModal.alert({
      ok_button_label: "OK",
      message: "Click 'I accept' you little turd!",
      title: "You have to!",
    });
    setTimeout(moreScaryModalRef.destroy, 500);
  }

  let moreScaryModalRef
  function showMoreScaryConfirm() {
    moreScaryModalRef = SmoothModal.confirm({
      ok_button_label: "Argh, OK",
      cancel_button_label: "Go away!",
      message: "We are sorry, but this is not optional.",
      title: "This is not optional",
      onResponse: ({ action }) => {
        console.log({ action });
        if (action === "dismiss") {
          showMustAcceptModal();
          return true;
        }
      },
    });
  }

  SmoothModal.confirm({
    ok_button_label: "I accept",
    cancel_button_label: "No",
    message: "Do you accept our nasty Terms & Conditions?",
    title: "Please accept this",
    onResponse: ({ action }) => {
      console.log({ action });
      if (action === "dismiss") {
        showMoreScaryConfirm();
        return true;
      }
    },
  });
};
