import axios from 'axios';
import * as z from 'zod';
import '../styles/main.css';
import { formatedPrice } from './utils/helpers';

axios.defaults.baseURL = `${import.meta.env.VITE_API_BASE_URL}`;
axios.defaults.headers.post['Content-Type'] = 'application/json';

const productSelector = document.querySelector('.productSelect');
const tableBody = document.querySelector('.shoppingCart-tableBody');
const totalPrice = document.getElementById('totalPrice');
const discardAllBtn = document.querySelector('.discardAllBtn');
const orderInfoBtn = document.querySelector('.orderInfo-btn');
let productStore = [];
let cartsStore = [];

const productList = document.querySelector('.productWrap');

async function getProductList() {
  try {
    const res = await axios.get(`/api/livejs/v1/customer/${import.meta.env.VITE_API_PATH}/products`);

    productStore = res.data.products;
    renderProductList(productStore);
  } catch (error) {
    console.log(error);
    alert(error.response.data.message);
  }
}

function renderProductList(products) {
  productList.innerHTML = products
    .map(
      p => `<li class="productCard">
                   <h4 class="productType">新品</h4>
                   <img
                     src="${p.images}"
                     alt=""
                   />
                   <a href="#" class="addCardBtn" data-id="${p.id}">加入購物車</a>
                   <h3>${p.title}</h3>
                   <del class="originPrice">NT${formatedPrice(p.origin_price)}</del>
                   <p class="nowPrice">NT${formatedPrice(p.price)}</p>
                 </li>`,
    )
    .join('');
}

async function getCarts() {
  try {
    const res = await axios.get(
      `${import.meta.env.VITE_API_BASE_URL}/api/livejs/v1/customer/${import.meta.env.VITE_API_PATH}/carts`,
    );

    const { carts, finalTotal } = res.data;
    cartsStore = carts;
    renderCarts(cartsStore);
    renderTotalPrice(finalTotal);
  } catch (error) {
    console.log(error);
    alert(error.response.data.message);
    return;
  }
}

async function addToCarts(productId) {
  try {
    let quantity = 1;
    cartsStore.forEach(item => {
      if (item.product.id === productId) {
        quantity = item.quantity + 1;
      }
    });

    const res = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/api/livejs/v1/customer/${import.meta.env.VITE_API_PATH}/carts`,
      {
        data: {
          productId,
          quantity,
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    const { carts, finalTotal } = res.data;
    cartsStore = res.data.carts;
    renderCarts(carts);
    renderTotalPrice(finalTotal);
  } catch (error) {
    console.log(error);
    alert(error.response.data.message);
  }
}

async function removeFromCarts(cartId) {
  try {
    const res = await axios.delete(
      `${import.meta.env.VITE_API_BASE_URL}/api/livejs/v1/customer/${import.meta.env.VITE_API_PATH}/carts/${cartId}`,
    );

    const { carts, finalTotal } = res.data;
    renderCarts(carts);
    renderTotalPrice(finalTotal);
  } catch (error) {
    alert(error.response.data.message);
  }
}

async function removeAllFromCarts() {
  try {
    const res = await axios.delete(
      `${import.meta.env.VITE_API_BASE_URL}/api/livejs/v1/customer/${import.meta.env.VITE_API_PATH}/carts`,
    );

    const { carts, finalTotal } = res.data;
    renderCarts(carts);
    renderTotalPrice(finalTotal);
  } catch (error) {
    alert(error.response.data.message);
  }
}

function renderCarts(carts) {
  let contents = '';

  if (carts.length === 0) {
    contents = '目前購物車沒有商品';
  } else {
    carts.forEach(item => {
      contents += `<tr>
                     <td>
                       <div class="cardItem-title">
                         <img src="${item.product.images}" alt="" />
                         <p>${item.product.title}</p>
                       </div>
                     </td>
                     <td>NT${formatedPrice(item.product.price)}</td>
                     <td>${item.quantity}</td>
                     <td>NT${formatedPrice(item.product.price * item.quantity)}</td>
                     <td class="discardBtn">
                       <a href="#" class="material-icons" data-cart-id="${item.id}"> clear </a>
                     </td>
                   </tr>`;
    });
  }

  tableBody.innerHTML = contents;
}

function renderTotalPrice(price) {
  totalPrice.textContent = formatedPrice(price);
}

const schema = z.object({
  name: z.string().trim().min(1, { error: '必填' }),
  tel: z.string().refine(val => /^\d{2}-\d{8}$/.test(val), {
    message: '電話格式錯誤',
  }),
  email: z.email({ error: 'Email格式錯誤' }).trim(),
  address: z.string().trim().min(1, { error: '必填' }),
  payment: z.literal(['ATM', '信用卡', '超商付款']),
});

// 清除錯誤訊息
function clearErrorMessages() {
  const errorMessages = document.querySelectorAll('.orderInfo-message');
  errorMessages.forEach(msg => {
    msg.textContent = '';
  });
}

// 顯示錯誤訊息
function showErrorMessages(errors) {
  errors.forEach(error => {
    const messageElement = document.querySelector(`[data-message="${error.path[0]}"]`);
    if (messageElement) {
      messageElement.textContent = error.message;
    }
  });
}

orderInfoBtn.addEventListener('click', async e => {
  e.preventDefault();

  // 清除舊的錯誤訊息
  clearErrorMessages();

  if (cartsStore.length === 0) {
    alert('請加入商品到購物車~');
    return;
  }

  const customerName = document.getElementById('customerName').value;
  const customerPhone = document.getElementById('customerPhone').value;
  const customerEmail = document.getElementById('customerEmail').value;
  const customerAddress = document.getElementById('customerAddress').value;
  const tradeWay = document.getElementById('tradeWay').value;

  const userInfo = {
    name: customerName,
    tel: customerPhone,
    email: customerEmail,
    address: customerAddress,
    payment: tradeWay,
  };

  try {
    schema.parse(userInfo);
  } catch (error) {
    if (error instanceof z.ZodError) {
      showErrorMessages(error.issues);
      return;
    } else {
      // unexpected error
      alert(error);
      return;
    }
  }

  try {
    await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/api/livejs/v1/customer/${import.meta.env.VITE_API_PATH}/orders`,
      {
        data: {
          user: userInfo,
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    document.getElementById('customerName').value = '';
    document.getElementById('customerPhone').value = '';
    document.getElementById('customerEmail').value = '';
    document.getElementById('customerAddress').value = '';
    document.getElementById('tradeWay').value = 'ATM';

    cartsStore = [];
    renderCarts(cartsStore);
    renderTotalPrice(0);
  } catch (error) {
    alert(error.response.data.message);
  }
});

async function init() {
  await getProductList();

  productList.addEventListener('click', async e => {
    if (!e.target.dataset.id) {
      return;
    }

    e.preventDefault();
    await addToCarts(e.target.dataset.id);
  });

  productSelector.addEventListener('change', e => {
    const category = e.target.value;

    const filteredProducts = productStore.filter(p => {
      if (category === '全部') return productStore;
      return p.category === category;
    });

    renderProductList(filteredProducts);
  });

  await getCarts();

  tableBody.addEventListener('click', async e => {
    if (!e.target.dataset.cartId) {
      return;
    }

    e.preventDefault();
    await removeFromCarts(e.target.dataset.cartId);
  });

  discardAllBtn.addEventListener('click', async e => {
    e.preventDefault();
    await removeAllFromCarts();
  });
}

await init();
