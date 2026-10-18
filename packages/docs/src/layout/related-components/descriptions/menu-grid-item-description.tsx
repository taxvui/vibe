import React, { useMemo } from "react";
import { RelatedComponent } from "vibe-storybook-components";
import { DummyNavigableGrid } from "../../../pages/components/GridKeyboardNavigationContext/useGridKeyboardNavigationContext.stories.helpers";
import { Menu, MenuGridItem } from "@vibe/core";

export const MenuGridItemDescription = () => {
  const component = useMemo(() => {
    return (
      <Menu aria-label="Quick actions">
        <MenuGridItem>
          <DummyNavigableGrid itemRole="menuitem" itemsCount={8} numberOfItemsInLine={3} withoutBorder />
        </MenuGridItem>
      </Menu>
    );
  }, []);
  return (
    <RelatedComponent
      component={component}
      title="MenuGridItem"
      href="/?path=/docs/components-menu-menugriditem--docs"
      description="MenuGridItem can be used to place a grid-like, keyboard navigable container, inside a Menu."
    />
  );
};
