// Ochish logikasi
export const openModal = {
  mounted(el, binding) {
    el.addEventListener("click", () => {
      const fn = window[`open_${binding.value}`];
      if (fn) fn();
    });
  }
};

// Yopish logikasi
export const closeModal = {
  mounted(el, binding) {
    el.addEventListener("click", () => {
      const fn = window[`close_${binding.value}`];
      if (fn) fn();
    });
  }
};
