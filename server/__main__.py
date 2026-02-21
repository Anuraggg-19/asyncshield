# Run the federated learning server.
# Usage (from project root): python -m asyncshield.server
# Or: python -m asyncshield.server --port 8000
import argparse
import sys
import os

# Ensure project root is on path when run as __main__
_TOP = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if _TOP not in sys.path:
    sys.path.insert(0, _TOP)

import uvicorn

def main():
    parser = argparse.ArgumentParser(description="Asyncshield FL Server")
    parser.add_argument("--host", default=None, help="Bind host (default from ASYNCSHIELD_SERVER_HOST)")
    parser.add_argument("--port", type=int, default=None, help="Bind port (default from ASYNCSHIELD_SERVER_PORT)")
    args = parser.parse_args()
    from asyncshield.config import SERVER_HOST, SERVER_PORT
    host = args.host if args.host is not None else SERVER_HOST
    port = args.port if args.port is not None else SERVER_PORT
    uvicorn.run("asyncshield.server.main:app", host=host, port=port, reload=False)

if __name__ == "__main__":
    main()
