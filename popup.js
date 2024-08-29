const fillAnswerField = () => {
  const declOfNum = (value, words) => {
    const newValue = Math.abs(value) % 100;
    const num = newValue % 10;

    if (newValue > 10 && newValue < 20) return words[2];
    if (num > 1 && num < 5) return words[1];
    if (num == 1) return words[0];

    return words[2];
  }

  const translateMinutesToHours = (mins) => {
    const hours = (mins / 60);
    const rhours = Math.floor(hours);
    const minutes = (hours - rhours) * 60;
    const rminutes = Math.round(minutes);


    return `${rhours} ${declOfNum(rhours, ['час', 'часа', 'часов'])} ${rminutes} ${declOfNum(rminutes, ['минута', 'минуты', 'минут'])}`;
  }

  const calculateField = (title) => {
    let minutes = 0;

    document.querySelectorAll(`[title="${title}"]`).forEach(node => {
      const timeArr = node.parentNode.querySelector(".agile-additional-issue-field__value").textContent.split(' ');

      timeArr.forEach(time => {
        if (time.includes('d')) return minutes += parseInt(time.replace('d', '')) * 480;
        if (time.includes('h')) return minutes += parseInt(time.replace('h', '')) * 60;
        if (time.includes('m')) return minutes += parseInt(time.replace('m', ''));
      });
    });

    return translateMinutesToHours(minutes);
  }

  const findTasksWithoutFirstAssessment = () => {
    const tasks = [];

    document.querySelectorAll('.agile-issue__content').forEach(node => {
      if (!node.querySelector('[title="Первоначальная оценка"]')) {
        tasks.push(node.querySelector('.agile-issue__link-content').textContent);
      }
    });

    return tasks;
  }

  const firstAssessmentTime = calculateField('Первоначальная оценка');
  const spentTime = calculateField('Затрачено времени');
  const tasksWithoutFirstAssessment = findTasksWithoutFirstAssessment();

  return {
    firstAssessmentTime,
    spentTime,
    tasksWithoutFirstAssessment,
  }
}

const onResult = (frames) => {
  if (!frames || !frames.length) {
    alert("Нет доступа к текущему окну");
    return;
  }

  const firstAssessmentTimeEl = document.getElementById('first-assessment');
  const spentTimeEl = document.getElementById('spent-time');
  const tasksWithoutFirstAssessmentEl = document.getElementById('task-without-first-assessment');

  const { firstAssessmentTime, spentTime, tasksWithoutFirstAssessment } = frames[0].result;

  firstAssessmentTimeEl.textContent = firstAssessmentTime;
  spentTimeEl.textContent = spentTime;

  tasksWithoutFirstAssessmentEl.innerHTML = '';

  tasksWithoutFirstAssessment.forEach((task) => {
    const taskEl = document.createElement('li');
    taskEl.textContent = task;
    tasksWithoutFirstAssessmentEl.appendChild(taskEl);
  })

  const copyEl = document.querySelectorAll('.copy');
  copyEl.forEach((el) => {
    el.style.display = 'block';

    el.addEventListener('click', (e) => {
      const previousSibling = e.target.parentElement.childNodes[1];

      if (previousSibling.tagName === 'SPAN') {
        navigator.clipboard.writeText(previousSibling.textContent);
      }
      if (previousSibling.tagName === 'UL') {
        const res = [];

        previousSibling.childNodes.forEach((el) => {
          res.push(el.textContent);
        })

        navigator.clipboard.writeText(res.join('\n'));
      }
    });
  });
};

const actionBtn = document.getElementById('action');

actionBtn.addEventListener('click', () => {
  chrome.tabs.query({ active: true }, function (tabs) {
    const tab = tabs[0];
    if (tab) {
      chrome.scripting.executeScript(
        {
          target: { tabId: tab.id, allFrames: true },
          func: fillAnswerField
        },
        onResult,
      );
    } else {
      alert("Нет активной вкладки");
    }
  })
});
