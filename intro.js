// initially enable "normal" night mode
// after keypress, make voice synth "Warning! Power level critical. Process shutdown imminnent!"

// make a slow red fade-flashing and some screenshaking

// voice synth "Entering Emergency Manual Power Restoration Procedure"

// zoom in to diagram, fade to black, start "Camunda Presents" cutscene


function makeNight() {
  document.body.style.transition = 'filter 4s';
  document.body.style.filter="invert(1)";
  document.body.style.background = 'black';
  document.body.style.overflow = 'hidden';
}

function sayPowerCritical() {
  const synth = window.speechSynthesis;
  const utterThis = new SpeechSynthesisUtterance('Warning! Power level critical. Process shutdown imminent!');

  utterThis.voice = synth.getVoices().find(({name}) => name === ('Google UK English Male'));
  utterThis.pitch = .5;
  utterThis.rate = .9;

  synth.speak(utterThis);

  document.removeEventListener('keydown', sayPowerCritical);

  window.setTimeout(() => {
    window.setTimeout(startShaking, 3000);
    window.setTimeout(sayEnteringEmergency, 5000);
    window.setTimeout(fadeToBlack, 10000);

  }, 3000);
}

function startShaking() {
  const start = Date.now();
  function animate() {
    const intensity = (Date.now() - start) / 100;
    const offX = ~~(Math.random() * intensity - intensity / 2);
    const offY = ~~(Math.random() * intensity - intensity / 2);

    let zoom = 1;
    if(intensity > 60) {
      zoom += (intensity - 60);
    }

    document.body.style.transform = `scale(${zoom}) translate(${offX}px, ${offY}px)`;
    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
}

function fadeToBlack() {
  const blackScreen = document.createElement('div');
  blackScreen.style.background = 'white';
  blackScreen.style.position = 'fixed';
  blackScreen.style.zIndex = '9998';
  blackScreen.style.top = '0';
  blackScreen.style.width = '100%';
  blackScreen.style.height = '100%';
  blackScreen.style.opacity = '0';
  blackScreen.style.transition = 'opacity 1s';

  document.body.appendChild(blackScreen);

  window.setTimeout(() => {
    blackScreen.style.opacity = '1';
  }, 100);
}

function sayEnteringEmergency() {
  const synth = window.speechSynthesis;
  const utterThis = new SpeechSynthesisUtterance('Entering Emergency Energy Restoration Procedure');

  utterThis.voice = synth.getVoices().find(({name}) => name === ('Google UK English Male'));
  utterThis.pitch = .5;
  utterThis.rate = .9;

  synth.speak(utterThis);
}

export default function intro() {
  return new Promise(resolve => {
    // step 1
    makeNight();

    document.addEventListener('keydown', sayPowerCritical);

  });
}
