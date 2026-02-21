# Run a federated learning client.
# Usage (from project root): python -m asyncshield.client           (default: trainer1)
#        python -m asyncshield.client --trainer 1
#        python -m asyncshield.client --trainer 2
import argparse
import os
import sys

# Ensure project root is on path
_TOP = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if _TOP not in sys.path:
    sys.path.insert(0, _TOP)

def main():
    parser = argparse.ArgumentParser(description="Asyncshield FL Client")
    parser.add_argument("--trainer", type=int, choices=[1, 2], default=1,
                        help="1=RobustCNN+DP (trainer1), 2=SimpleMLP (trainer2)")
    args = parser.parse_args()
    if args.trainer == 1:
        from asyncshield.client.trainer1 import run_trainer
    else:
        from asyncshield.client.trainer2 import run_trainer
    run_trainer()

if __name__ == "__main__":
    main()
