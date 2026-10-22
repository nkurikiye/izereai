const dotField = document.querySelector('.allocation-dots');
if (dotField) {
  for (let index = 0; index < 100; index += 1) {
    const dot = document.createElement('i');
    if (index < 32) dot.className = 'active';
    dotField.append(dot);
  }
}

if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      revealObserver.unobserve(entry.target);
    }
  }), { threshold: .1 });
  document.querySelectorAll('.reveal').forEach(element => revealObserver.observe(element));
} else {
  document.querySelectorAll('.reveal').forEach(element => element.classList.add('in-view'));
}
