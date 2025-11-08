import axios from 'axios';
import { timestampToDate } from './utils/helpers';
import '../styles/admin.css';

// C3.js
const chart = c3.generate({
  bindto: '#chart', // HTML 元素綁定
  data: {
    type: 'pie',
    columns: [
      ['Louvre 雙人床架', 1],
      ['Antony 雙人床架', 2],
      ['Anty 雙人床架', 3],
      ['其他', 4],
    ],
    colors: {
      'Louvre 雙人床架': '#DACBFF',
      'Antony 雙人床架': '#9D7FEA',
      'Anty 雙人床架': '#5434A7',
      其他: '#301E5F',
    },
  },
});

const orderTableBody = document.querySelector('.orderPage-tableBody');
let orderData = [];

await init();

async function init() {
  await getOrderList();
  renderOrderList(orderData);

  orderTableBody.addEventListener('click', async e => {
    e.preventDefault();
    const target = e.target;
    const className = target.getAttribute('class');
    if (className === 'orderStatus-Btn') {
      const { id, status } = target.dataset;

      const newStatus = !(status === 'true');

      await changeOrderStatus(id, newStatus);
      renderOrderList(orderData);
      return;
    }

    if (className === 'delSingleOrder-Btn') {
      const { id } = target.dataset;
      await deleteOrder(id);
      renderOrderList(orderData);
      return;
    }

    return;
  });
}

async function getOrderList() {
  try {
    const res = await axios.get(
      `${import.meta.env.VITE_API_BASE_URL}/api/livejs/v1/admin/${import.meta.env.VITE_API_PATH}/orders`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: import.meta.env.VITE_TOKEN,
        },
      },
    );

    const { orders } = res.data;
    orderData = orders;
  } catch (error) {
    alert(error.response.data.message);
  }
}

function renderOrderList(orders) {
  let contents = '';
  if (orders.length === 0) {
    contents = '目前沒有訂單';
  } else {
    contents = orders
      .map(order => {
        const { products } = order;
        const productContents = products.map(p => `<p>${p.title} x ${p.quantity}</p>`).join('');

        return `<tr>
              <td>${order.id}</td>
              <td>
                <p>${order.user.name}</p>
                <p>${order.user.tel}</p>
              </td>
              <td>${order.user.address}</td>
              <td>${order.user.email}</td>
              <td>${productContents}</td>
              <td>${timestampToDate(order.createdAt)}</td>
              <td class="orderStatus">
                <a href="#" class="orderStatus-Btn" data-id="${order.id}" data-status="${order.paid}">${order.paid ? '已處理' : '未處理'}</a>
              </td>
              <td>
                <input type="button" class="delSingleOrder-Btn" value="刪除" data-id="${order.id}" />
              </td>
            </tr>`;
      })
      .join('');
  }

  orderTableBody.innerHTML = contents;
}

async function changeOrderStatus(orderId, orderStatus) {
  try {
    const res = await axios.put(
      `${import.meta.env.VITE_API_BASE_URL}/api/livejs/v1/admin/${import.meta.env.VITE_API_PATH}/orders`,
      {
        data: {
          id: orderId,
          paid: orderStatus,
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: import.meta.env.VITE_TOKEN,
        },
      },
    );

    const { orders } = res.data;
    orderData = orders;
  } catch (error) {
    alert(error.response.data.message);
  }
}

async function deleteOrder(orderId) {
  try {
    const res = await axios.delete(
      `${import.meta.env.VITE_API_BASE_URL}/api/livejs/v1/admin/${import.meta.env.VITE_API_PATH}/orders/${orderId}`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: import.meta.env.VITE_TOKEN,
        },
      },
    );

    const { orders } = res.data;
    orderData = orders;
  } catch (error) {
    alert(error.response.data.message);
  }
}
