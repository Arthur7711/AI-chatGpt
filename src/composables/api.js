import { ref } from "vue";
import { useCookies } from "vue3-cookies";

const api = () => {
  const stream = ref(false);
  const token = useCookies().cookies.get("Access-Token");

  const completeChat = (
    messages,
    model,
    max_tokens,
    temperature,
    top_p,
    frequency_penalty,
    presence_penalty,
    stop,
    raw_system,
    progressCallback
  ) => {
    if (stream.value !== false) {
      stream.value.abort();
    }

    // Important, XHR need
    // cause fetch doesn't have .abort()
    const xhr = new XMLHttpRequest();

    stream.value = xhr;

    return new Promise(function (resolve, reject) {
      const headers = { "Content-Type": "application/json" };

      xhr.seenBytes = 0;
      xhr.open("POST", import.meta.env.VITE_APP_URL + "chat");
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.setRequestHeader("Authorization", "Bearer " + token);
      Object.entries(headers).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value);
      });

      let responseObj = {
        content: "",
        role: "",
      };

      xhr.onreadystatechange = async function () {
        if (xhr.readyState === 3 || xhr.readyState === 4) {
          const newData = xhr.response.substring(xhr.seenBytes);
          xhr.seenBytes = xhr.responseText.length;

          const lines = newData.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              if (line === "data: [DONE]") {
                continue;
              }

              try {
                const data = JSON.parse(line.slice(6));

                responseObj["content"] += data["content"];
                responseObj["role"] = data["role"];

                progressCallback(responseObj);
              } catch (e) {
                console.warn("Error parsing line:", line);
                console.warn("Error parsing error:", e);
              }
            } else if (line.startsWith("error: ")) {
              const data = JSON.parse(line.slice(7));

              reject(data["error"]["message"]);
            } else if (line.startsWith("result: ")) {
              const data = JSON.parse(line.slice(8));

              resolve(responseObj);
            }
          }
        }
      };

      xhr.onload = function () {
        if (xhr.status !== 200) {
          let error_text = "";

          try {
            const error_data = JSON.parse(xhr.response);

            try {
              error_text = JSON.parse(xhr.response)["body"]["message"];
            } catch {}

            try {
              error_text = JSON.parse(xhr.response)["error"]["message"];
            } catch {}
          } catch {}

          reject(error_text);
        }
      };

      const data = {
        messages: messages,
        model: model,
        max_tokens: max_tokens,
        temperature: temperature,
        top_p: top_p,
        frequency_penalty: frequency_penalty,
        presence_penalty: presence_penalty,
        stop: stop,
        raw_system: raw_system,
        stream: true,
      };

      xhr.send(JSON.stringify(data));
    });
  };

  const complete = (
    prompt,
    model,
    max_tokens,
    temperature,
    top_p,
    frequency_penalty,
    presence_penalty,
    stop,
    logprobs,
    progressCallback
  ) => {
    if (stream.value !== false) {
      stream.value.abort();
    }

    // Important, XHR need
    // cause fetch doesn't have .abort()
    const xhr = new XMLHttpRequest();

    stream.value = xhr;

    return new Promise(function (resolve, reject) {
      const headers = { "Content-Type": "application/json" };

      xhr.seenBytes = 0;
      xhr.open("POST", import.meta.env.VITE_APP_URL + "complete");
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.setRequestHeader("Authorization", "Bearer " + token);
      Object.entries(headers).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value);
      });

      let responseObj = {
        text: "",
        top_logprobs: [],
      };

      xhr.onreadystatechange = async function () {
        if (xhr.readyState === 3 || xhr.readyState === 4) {
          const newData = xhr.response.substring(xhr.seenBytes);
          xhr.seenBytes = xhr.responseText.length;

          const lines = newData.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              if (line === "data: [DONE]") {
                continue;
              }

              try {
                const data = JSON.parse(line.slice(6));

                responseObj["text"] += data["text"];
                responseObj["top_logprobs"].push(data["top_logprobs"]);

                try {
                  progressCallback({
                    full: responseObj,
                    part: {
                      token: data["text"],
                      top_logprobs: data["top_logprobs"],
                    },
                  });
                } catch (e) {
                  console.error(e);
                }
              } catch (e) {
                console.warn(`Error parsing line: '${line}', error:`, e);
              }
            } else if (line.startsWith("error: ")) {
              const data = JSON.parse(line.slice(7));

              reject(data["error"]["message"]);
            } else if (line.startsWith("result: ")) {
              const data = JSON.parse(line.slice(8));

              resolve(responseObj);
            }
          }
        }
      };

      xhr.onload = function () {
        if (xhr.status !== 200) {
          let error_text = "";

          try {
            const error_data = JSON.parse(xhr.response);

            try {
              error_text = JSON.parse(xhr.response)["body"]["message"];
            } catch {}

            try {
              error_text = JSON.parse(xhr.response)["error"]["message"];
            } catch {}
          } catch {}

          reject(error_text);
        }
      };

      const data = {
        model: model,
        prompt: prompt,
        max_tokens: max_tokens,
        temperature: temperature,
        top_p: top_p,
        frequency_penalty: frequency_penalty,
        presence_penalty: presence_penalty,
        stop: stop,
        logprobs: logprobs,
        stream: true,
      };

      xhr.send(JSON.stringify(data));
    });
  };

  const abort = () => {
    console.log(stream.value);
    stream.value.abort();

    stream.value = false;
  };

  return { completeChat, complete, abort };
};

export default api();
