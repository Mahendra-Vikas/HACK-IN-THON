from dotenv import load_dotenv
import os

from livekit import agents
from livekit.agents import AgentSession, Agent, RoomInputOptions

# Optional plugin imports: make noise cancellation optional so the module
# can run even if the optional plugin package isn't installed.
try:
    from livekit.plugins import noise_cancellation
except Exception:
    noise_cancellation = None

try:
    from livekit.plugins import google
except Exception:
    google = None

try:
    from livekit.plugins import openai
except Exception:
    openai = None

from prompts import AGENT_INSTRUCTION, SESSION_INSTRUCTION
from tools import get_weather, search_web, send_email

load_dotenv()


class Assistant(Agent):
    def __init__(self) -> None:
        # Try OpenAI realtime first (most reliable)
        if openai is not None and os.getenv("OPENAI_API_KEY") and os.getenv("OPENAI_API_KEY").strip():
            print("🤖 Using OpenAI Realtime Model")
            super().__init__(
                instructions=AGENT_INSTRUCTION,
                llm=openai.realtime.RealtimeModel(
                    voice="alloy",
                    temperature=0.8,
                ),
                tools=[
                    get_weather,
                    search_web,
                    send_email,
                ],
            )
        elif google is not None and os.getenv("GOOGLE_API_KEY") and os.getenv("GOOGLE_API_KEY").strip():
            print("🤖 Using Google Gemini Chat Model with TTS (fallback)")
            # Use regular chat model with TTS instead of realtime
            super().__init__(
                instructions=AGENT_INSTRUCTION,
                llm=google.llm.LLM(),  # Regular chat model
                tts=google.tts.TTS(voice="en-US-Casual-K"),  # Separate TTS
                tools=[
                    get_weather,
                    search_web,
                    send_email,
                ],
            )
        else:
            # Check what's available and provide better error message
            if google is None:
                google_error = "Google module not available (import failed)"
            else:
                google_key = os.getenv("GOOGLE_API_KEY")
                google_error = f"Google API key {'is empty' if not google_key else 'is present'}"
                
            if openai is None:
                openai_error = "OpenAI module not available (import failed)"
            else:
                openai_key = os.getenv("OPENAI_API_KEY")
                openai_error = f"OpenAI API key {'is empty' if not openai_key else 'is present'}"
                
            raise ImportError(
                f"❌ No valid API key found or module loaded:\n- OpenAI: {openai_error}\n- Google: {google_error}\n\nPlease set either OPENAI_API_KEY or GOOGLE_API_KEY in your .env file."
            )
        


async def entrypoint(ctx: agents.JobContext):
    session = AgentSession(
        
    )

    await session.start(
        room=ctx.room,
        agent=Assistant(),
        # Build RoomInputOptions dynamically — include noise cancellation
        # only if the plugin is available.
        room_input_options=(
            RoomInputOptions(video_enabled=True, noise_cancellation=noise_cancellation.BVC())
            if noise_cancellation is not None
            else RoomInputOptions(video_enabled=True)
        ),
    )

    await ctx.connect()

    await session.generate_reply(
        instructions=SESSION_INSTRUCTION,
    )


if __name__ == "__main__":
    agents.cli.run_app(agents.WorkerOptions(entrypoint_fnc=entrypoint))