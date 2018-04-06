// initially enable "normal" night mode
// after keypress, make voice synth "Warning! Power level critical. Process shutdown imminnent!"

// make a slow red fade-flashing and some screenshaking

// voice synth "Entering Emergency Manual Power Restoration Procedure"

// zoom in to diagram, fade to black, start "Camunda Presents" cutscene

// camunda presents fades, Nightmode title screen appears

// maybe for the music: https://www.reddit.com/r/gamedev/comments/4afwah/procedural_music_generator_written_in_javascript/

function makeNight() {
  document.body.style.transition = 'filter 2s';
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

    if(intensity > 80) {
      document.body.style.transform = '';
    } else {
      requestAnimationFrame(animate);
    }
  }

  requestAnimationFrame(animate);
}

function fadeToBlack() {
  const blackScreen = document.createElement('div');
  blackScreen.setAttribute('id', 'blackscreen');
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

function restoreBackground() {
  document.body.style.transition = '';

  window.setTimeout(() => {
    document.body.style.filter="";
    document.body.style.background = 'white';
    document.getElementById('blackscreen').style.background = 'black';
  }, 100);
}

function showCamundaPresents() {
  const blackScreen = document.getElementById('blackscreen');

  const content = document.createElement('div');

  const logo = document.createElement('div');
  logo.innerHTML = '<div cam-widget-header style="border-top: 0; background-color: transparent; box-shadow: none; font-size: 300px; display: inline-block; margin-left: calc(50vw - 650px); margin-top: calc(50vh - 200px);"><span class="brand-logo" style="filter: drop-shadow(0 0 10px #844);"></span> <span style="font-size: 0.7em; vertical-align: text-top; color: #ddd; filter: drop-shadow(0px 0px 5px #fff);">Camunda</span></div>';
  content.appendChild(logo);
  logo.style.transition = 'opacity 2s';
  logo.style.opacity = '0';

  const presents = document.createElement('div');
  presents.style.fontSize='80px';
  presents.style.color= '#ddd';
  presents.style.marginLeft= 'calc(50vw + 450px)';
  presents.style.marginTop= 'calc(50vh + 80px)';
  presents.style.filter= 'drop-shadow(0 0 3px)';
  presents.style.transition = 'opacity 2s';
  presents.style.opacity = '0';

  presents.textContent = 'presents';
  content.appendChild(presents);

  blackScreen.appendChild(content);

  window.setTimeout(() => {
    logo.style.opacity = '1';
  }, 100);

  window.setTimeout(() => {
    presents.style.opacity = '1';
  }, 1500);


  window.setTimeout(() => {
    logo.style.opacity = '0';
    presents.style.opacity = '0';
  }, 4000);
}

function removeBlackscreen() {
  const blackScreen = document.getElementById('blackscreen');

  blackScreen.parentNode.removeChild(blackScreen);
}

function showNightmodeSplash() {
  const blackScreen = document.getElementById('blackscreen');

  const content = document.createElement('div');
  content.style.position = "absolute";
  content.style.top = "calc(50% - 218px)";
  content.style.fontSize = "300px";
  content.style.left = "calc(50% - 714px)";
  content.style.transition = 'filter 3s, opacity 3s';

  // moon
  const moon = document.createElement('div');
  moon.innerHTML = '&#x1F319;&#xFE0E;';
  moon.style.position= 'absolute';
  moon.style.top= '0';
  moon.style.left= '1100px';
  moon.style.transition = 'opacity 3s, color 0.5s';
  moon.style.opacity = '0';
  content.appendChild(moon);

  const name = document.createElement('div');
  name.innerHTML = '<div>NIGHTMODE</div>';
  name.style.color = '#134f90';
  name.style.fontFamily = 'Iceland';
  name.style.transition = 'opacity 3s, color 0.5s';
  name.style.opacity = '0';
  name.style.position = 'absolute';

  content.appendChild(name);
  blackScreen.appendChild(content);

  window.setTimeout(() => {
    name.style.opacity = '1';
    moon.style.opacity = '1';
  }, 100);

  function makeShadow(intensity) {
    name.style.textShadow = `0 0 ${intensity}px #fff, 0 0 ${intensity * 2}px #fff, 0 0 ${intensity * 3}px #fff, 0 0 ${intensity * 4}px #228DFF, 0 0 ${intensity * 7}px #228DFF, 0 0 ${intensity * 8}px #228DFF, 0 0 ${intensity * 10}px #228DFF, 0 0 ${intensity * 15}px #228DFF`;
  }

  window.setTimeout(() => {
    name.style.color = '#fff';
    makeShadow(10);
  }, 3500);

  window.setTimeout(() => name.style.transition = 'opacity 3s, color 0.5s, text-shadow 1.5s', 3600);
  window.setTimeout(() => makeShadow(5), 4000);
  window.setTimeout(() => makeShadow(10), 6500);
  window.setTimeout(() => makeShadow(5), 8000);

  window.setTimeout(() => {
    content.style.filter = 'blur(200px)';
    content.style.opacity = '0';
  }, 8000);
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

    const introAnimation = () => {
      document.removeEventListener('keydown', introAnimation);
      sayPowerCritical();
      window.setTimeout(startShaking, 6000);
      window.setTimeout(sayEnteringEmergency, 8000);
      window.setTimeout(fadeToBlack, 13000);
      window.setTimeout(restoreBackground, 14100);
      window.setTimeout(showCamundaPresents, 14300);
      window.setTimeout(showNightmodeSplash, 20300);
      window.setTimeout(resolve, 29300);
      window.setTimeout(removeBlackscreen, 40000);
    };

    document.addEventListener('keydown', introAnimation);
  });
}
