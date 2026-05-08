const API_KEY =
  import.meta.env
    .VITE_GEMINI_API_KEY

const API_URL =
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`

export const generateAIReport =
  async (activities) => {

    try {

      const activityData =

        activities.map(
          (activity) => ({

            title:
              activity.title,

            status:
              activity.status,

            audience:
              activity.audience_count,

            category:
              activity.category,

            date:
              activity.date,
          })
        )

      const prompt = `
Analyze this campus activity data.

Return:
- short executive summary
- participation insight
- one recommendation

Keep response under 120 words.

Data:
${JSON.stringify(activityData)}
`

      const response =
        await fetch(
          API_URL,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({

              contents: [
                {
                  parts: [
                    {
                      text: prompt,
                    },
                  ],
                },
              ],
            }),
          }
        )

      const data =
        await response.json()
        console.log(
  "Gemini Response:",
  data
)

      if (data.error) {

  console.error(
    "Gemini API Error:",
    data.error
  )

return (
  "AI servers are currently busy. Please try again in a few minutes."
)
}

return (

  data?.candidates?.[0]
    ?.content?.parts?.[0]
    ?.text

  ||

  "AI analysis unavailable."
)

    } catch (error) {

      console.error(
  "Gemini Error:",
  error
)

      return (
        "Failed to generate AI report."
      )
    }
  }