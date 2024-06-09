import { useCookies } from "vue3-cookies";
import { useRouter } from "vue-router";

const { cookies } = useCookies();
export const auth = async () => {
  const router = useRouter();
  if (import.meta.env.VITE_APP_URL) {
    await fetch(`${import.meta.env.VITE_APP_URL}user/self`, {
      headers: {
        Accept: "application/json",
        Authorization: "Bearer " + cookies.get("Access-Token"),
      },
    })
      .then((response) => {
        return response.json();
      })
      .catch((error) => {
        if (error.status === 403) {
          router.push({ path: "/403" });
        }
      });
  }
};
export const createHelpdescTask = async (text: string) => {
  await fetch(import.meta.env.VITE_APP_URL + "helpdesk/create_task", {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: "Bearer " + cookies.get("Access-Token"),
    },
    body: JSON.stringify({
      text: text,
      task_type: 81,
    }),
  }).then(async (response) => {
    const data = await response.json();
    return data;
  });
};
