#include <atomic>
#include <cassert>

int payload = 0;
std::atomic<bool> ready{false};

void producer() {
  payload = 1;
  ready.store(true, std::memory_order_release);
}

void consumer() {
  if (ready.load(std::memory_order_acquire)) {
    assert(payload == 1);
  }
}
