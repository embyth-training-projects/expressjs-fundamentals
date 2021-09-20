const deleteButtons = document.querySelectorAll(".delete-form .delete-btn");

const deleteProductHandler = (evt) => {
  const target = evt.target;

  const prodId = target.parentNode.querySelector("[name=productId]").value;
  const csrf = target.parentNode.querySelector("[name=_csrf]").value;

  const productElement = target.closest("article");

  let isResponseOk;

  fetch(`/admin/product/${prodId}`, {
    method: "DELETE",
    headers: {
      "csrf-token": csrf,
    },
  })
    .then((result) => {
      isResponseOk = result.ok;

      return result.json();
    })
    .then((data) => {
      if (!isResponseOk) {
        throw new Error(data.message);
      }
      productElement.parentNode.removeChild(productElement);
    })
    .catch((err) => {
      console.error(err);
    });
};

deleteButtons.forEach((button) =>
  button.addEventListener("click", deleteProductHandler)
);
